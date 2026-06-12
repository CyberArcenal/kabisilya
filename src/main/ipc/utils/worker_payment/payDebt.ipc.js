// src/main/ipc/workerPayment/payDebt.ipc.js
const { saveDb, updateDb } = require("../../../../utils/dbUtils/dbActions");
const { AppDataSource } = require("../../../db/data-source");
const Debt = require("../../../../entities/Debt");
const DebtHistory = require("../../../../entities/DebtHistory");
const Payment = require("../../../../entities/Payment");
const PaymentHistory = require("../../../../entities/PaymentHistory");
const auditLogger = require("../../../../utils/auditLogger");
const {
  farmDebtAllocationStrategy,
} = require("../../../../utils/settings/system");

/**
 * Use a worker's pending payments to pay off their outstanding debts.
 * Allocates according to the configured debt allocation strategy.
 * @param {Object} params - { workerId, amount, paymentMethod?, notes? }
 * @param {import("typeorm").QueryRunner} queryRunner
 */
module.exports = async (params, queryRunner) => {
  try {
    const { workerId, amount, paymentMethod, notes } = params;

    if (!workerId) throw new Error("workerId is required");
    if (!amount || amount <= 0) throw new Error("amount must be positive");

    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const debtRepo = queryRunner.manager.getRepository(Debt);
    const historyRepo = queryRunner.manager.getRepository(DebtHistory);
    const paymentHistoryRepo =
      queryRunner.manager.getRepository(PaymentHistory);

    // 1. Fetch pending payments (netPay > 0) for this worker, oldest first
    const payments = await paymentRepo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.worker", "worker")
      .where("worker.id = :workerId", { workerId })
      .andWhere("payment.status IN (:...statuses)", {
        statuses: ["pending", "partially_paid"],
      })
      .andWhere("payment.netPay > 0")
      .orderBy("payment.paymentDate", "ASC")
      .addOrderBy("payment.createdAt", "ASC")
      .getMany();

    const availablePayments = payments.filter((p) => parseFloat(p.netPay) > 0);
    if (availablePayments.length === 0) {
      return {
        status: false,
        message: "No pending payments available for this worker",
        data: null,
      };
    }

    // 2. Fetch outstanding debts (balance > 0) for this worker, oldest first
    const debts = await debtRepo
      .createQueryBuilder("debt")
      .leftJoinAndSelect("debt.worker", "worker")
      .where("worker.id = :workerId", { workerId })
      .andWhere("debt.status IN (:...statuses)", {
        statuses: ["pending", "partially_paid", "overdue"],
      })
      .andWhere("debt.balance > 0")
      .orderBy("debt.dateIncurred", "ASC")
      .addOrderBy("debt.createdAt", "ASC")
      .getMany();

    const outstandingDebts = debts.filter((d) => parseFloat(d.balance) > 0);
    if (outstandingDebts.length === 0) {
      return {
        status: false,
        message: "No outstanding debts for this worker",
        data: null,
      };
    }

    // 3. Get allocation strategy from settings
    const strategy = await farmDebtAllocationStrategy();

    // 4. Determine per‑debt target allocations based on strategy
    const allocations = []; // { debt, targetAmount }

    if (strategy === "auto") {
      // FIFO: allocate as much as possible to the oldest debt, then next, etc.
      // This is equivalent to having targets equal to each debt's full balance,
      // processed in order. We'll handle this by the existing loop later.
      // For simplicity, we keep the original auto path separate.
      // We'll use a flag to reuse old code.
    } else if (strategy === "proportional") {
      const totalBalance = outstandingDebts.reduce(
        (sum, d) => sum + parseFloat(d.balance),
        0,
      );
      if (amount >= totalBalance) {
        // Pay all debts in full
        outstandingDebts.forEach((d) =>
          allocations.push({ debt: d, targetAmount: parseFloat(d.balance) }),
        );
      } else {
        // Proportional split
        outstandingDebts.forEach((d) => {
          const target = (parseFloat(d.balance) / totalBalance) * amount;
          allocations.push({ debt: d, targetAmount: target });
        });
      }
    } else if (strategy === "equal") {
      let remaining = amount;
      let debtsList = outstandingDebts.map((d) => ({
        ...d,
        remainingBalance: parseFloat(d.balance),
      }));

      while (remaining > 0 && debtsList.length > 0) {
        const equalShare = remaining / debtsList.length;

        // Find debts that cannot take the full equal share
        const underfunded = debtsList.filter(
          (d) => d.remainingBalance < equalShare,
        );

        if (underfunded.length > 0) {
          // Pay off underfunded debts completely
          for (const d of underfunded) {
            allocations.push({ debt: d, targetAmount: d.remainingBalance });
            remaining -= d.remainingBalance;
          }
          // Remove paid‑off debts
          debtsList = debtsList.filter(
            (d) => !underfunded.some((u) => u.id === d.id),
          );
        } else {
          // All remaining debts can take the equal share
          for (const d of debtsList) {
            allocations.push({ debt: d, targetAmount: equalShare });
          }
          remaining = 0;
        }
      }
      // If remaining > 0 here, it will be reported as unapplied later.
    }

    // 5. Apply the allocations by deducting from payments (oldest payments first)
    let paymentIndex = 0;
    const updatedPayments = [];
    const updatedDebts = [];
    const histories = []; // DebtHistory records
    const paymentHistories = []; // PaymentHistory records

    // For `auto` strategy we reuse the original loop (simpler and already FIFO)
    if (strategy === "auto") {
      let remainingAmount = amount;
      let pIdx = 0;
      let dIdx = 0;

      while (
        remainingAmount > 0 &&
        pIdx < availablePayments.length &&
        dIdx < outstandingDebts.length
      ) {
        const payment = availablePayments[pIdx];
        const debt = outstandingDebts[dIdx];

        const paymentAvailable = parseFloat(payment.netPay);
        const debtBalance = parseFloat(debt.balance);

        const amountToUse = Math.min(
          remainingAmount,
          paymentAvailable,
          debtBalance,
        );

        if (amountToUse <= 0) {
          if (paymentAvailable <= 0) pIdx++;
          if (debtBalance <= 0) dIdx++;
          continue;
        }

        // Update payment
        const oldNetPay = payment.netPay;
        payment.netPay = (paymentAvailable - amountToUse).toFixed(2);
        payment.totalDebtDeduction = (
          parseFloat(payment.totalDebtDeduction || 0) + amountToUse
        ).toFixed(2);
        payment.updatedAt = new Date();
        if (parseFloat(payment.netPay) === 0) {
          payment.status = "completed";
          payment.paymentDate = new Date();
        }
        const updatedPayment = await updateDb(paymentRepo, payment);
        updatedPayments.push(updatedPayment);

        // PaymentHistory
        const paymentHistory = paymentHistoryRepo.create({
          payment: updatedPayment,
          actionType: "debt_deduction",
          changedField: "netPay",
          oldAmount: oldNetPay,
          newAmount: payment.netPay,
          notes: notes || `Deducted ${amountToUse} for debt #${debt.id}`,
          performedBy: "system",
        });
        await saveDb(paymentHistoryRepo, paymentHistory);
        paymentHistories.push(paymentHistory);

        // Update debt
        const oldDebtBalance = debt.balance;
        const oldDebtStatus = debt.status;
        debt.balance = (debtBalance - amountToUse).toFixed(2);
        debt.totalPaid = (
          parseFloat(debt.totalPaid || 0) + amountToUse
        ).toFixed(2);
        debt.lastPaymentDate = new Date();
        debt.updatedAt = new Date();
        if (parseFloat(debt.balance) === 0) {
          debt.status = "paid";
        } else {
          debt.status = "partially_paid";
        }
        const updatedDebt = await updateDb(debtRepo, debt);
        updatedDebts.push(updatedDebt);

        // DebtHistory
        const debtHistory = historyRepo.create({
          debt: updatedDebt,
          payment: updatedPayment,
          amountPaid: amountToUse,
          previousBalance: oldDebtBalance,
          newBalance: debt.balance,
          transactionType: "payment",
          paymentMethod,
          notes: notes || `Debt payment using pending payment #${payment.id}`,
        });
        const savedDebtHistory = await saveDb(historyRepo, debtHistory);
        histories.push(savedDebtHistory);

        // Audit logs
        await auditLogger.logUpdate(
          "Payment",
          payment.id,
          { netPay: oldNetPay, totalDebtDeduction: payment.totalDebtDeduction },
          {
            netPay: payment.netPay,
            totalDebtDeduction: payment.totalDebtDeduction,
          },
          "system",
        );

        await auditLogger.logUpdate(
          "Debt",
          debt.id,
          { balance: oldDebtBalance, status: oldDebtStatus },
          { balance: debt.balance, status: debt.status },
          "system",
        );
        await auditLogger.logCreate(
          "DebtHistory",
          savedDebtHistory.id,
          savedDebtHistory,
          "system",
        );

        remainingAmount -= amountToUse;

        if (parseFloat(payment.netPay) === 0) pIdx++;
        if (parseFloat(debt.balance) === 0) dIdx++;
      }

      return {
        status: true,
        message: `Debt payment of ${amount - remainingAmount} applied successfully`,
        data: {
          payments: updatedPayments,
          debts: updatedDebts,
          histories,
          paymentHistories,
        },
        unappliedAmount: remainingAmount,
      };
    } else {
      // Equal or proportional – process pre‑computed allocations
      let totalApplied = 0;

      for (const alloc of allocations) {
        const debt = alloc.debt;
        let target = alloc.targetAmount;

        if (target <= 0) continue;

        // Track how much we actually deduct from payments for this debt
        let deductedForDebt = 0;

        while (target > 0 && paymentIndex < availablePayments.length) {
          const payment = availablePayments[paymentIndex];
          const paymentAvailable = parseFloat(payment.netPay);

          if (paymentAvailable <= 0) {
            paymentIndex++;
            continue;
          }

          const amountToUse = Math.min(target, paymentAvailable);

          // Update payment
          const oldNetPay = payment.netPay;
          payment.netPay = (paymentAvailable - amountToUse).toFixed(2);
          payment.totalDebtDeduction = (
            parseFloat(payment.totalDebtDeduction || 0) + amountToUse
          ).toFixed(2);
          payment.updatedAt = new Date();
          if (parseFloat(payment.netPay) === 0) {
            payment.status = "completed";
            payment.paymentDate = new Date();
          }
          const updatedPayment = await updateDb(paymentRepo, payment);
          updatedPayments.push(updatedPayment);

          // PaymentHistory
          const paymentHistory = paymentHistoryRepo.create({
            payment: updatedPayment,
            actionType: "debt_deduction",
            changedField: "netPay",
            oldAmount: oldNetPay,
            newAmount: payment.netPay,
            notes: notes || `Deducted ${amountToUse} for debt #${debt.id}`,
            performedBy: "system",
          });
          await saveDb(paymentHistoryRepo, paymentHistory);
          paymentHistories.push(paymentHistory);

          deductedForDebt += amountToUse;
          target -= amountToUse;

          if (parseFloat(payment.netPay) === 0) paymentIndex++;
        }

        // After finishing this debt's target (or running out of payments), update the debt
        if (deductedForDebt > 0) {
          const oldDebtBalance = debt.balance;
          const oldDebtStatus = debt.status;
          const newBalance = parseFloat(debt.balance) - deductedForDebt;
          debt.balance = newBalance.toFixed(2);
          debt.totalPaid = (
            parseFloat(debt.totalPaid || 0) + deductedForDebt
          ).toFixed(2);
          debt.lastPaymentDate = new Date();
          debt.updatedAt = new Date();
          if (newBalance <= 0) {
            debt.status = "paid";
          } else {
            debt.status = "partially_paid";
          }
          const updatedDebt = await updateDb(debtRepo, debt);
          updatedDebts.push(updatedDebt);

          // DebtHistory – one entry per debt summarising the total paid from all payment chunks
          const debtHistory = historyRepo.create({
            debt: updatedDebt,
            payment: null, // Not linking to a single payment because multiple were used
            amountPaid: deductedForDebt,
            previousBalance: oldDebtBalance,
            newBalance: debt.balance,
            transactionType: "payment",
            paymentMethod,
            notes: notes || `Debt payment via multiple pending payments`,
          });
          const savedDebtHistory = await saveDb(historyRepo, debtHistory);
          histories.push(savedDebtHistory);

          // Audit log for debt update
          await auditLogger.logUpdate(
            "Debt",
            debt.id,
            { balance: oldDebtBalance, status: oldDebtStatus },
            { balance: debt.balance, status: debt.status },
            "system",
          );

          totalApplied += deductedForDebt;
        }
      }

      const unappliedAmount = amount - totalApplied;

      return {
        status: true,
        message: `Debt payment of ${totalApplied} applied successfully`,
        data: {
          payments: updatedPayments,
          debts: updatedDebts,
          histories,
          paymentHistories,
        },
        unappliedAmount,
      };
    }
  } catch (error) {
    console.error("Error in payDebt:", error);
    throw error;
  }
};

// services/payment/recordWorkerPayment.js
const { In } = require("typeorm");
const { logger } = require("../../utils/logger");
const auditLogger = require("../../utils/auditLogger");
const { roundToTwo, allocateDebtDeduction } = require("./utils");

/**
 * Record a bulk payment for a worker (one transaction covering debt deduction and multiple payments)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.paymentRepo
 * @param {import("typeorm").Repository} deps.historyRepo
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {Object} deps.debtService - DebtService instance
 * @param {Object} deps.interestService - InterestAccrualService instance
 * @param {Function} deps.farmSessionDefaultSessionId - Function to get default session
 * @param {Function} deps.updateDb - updateDb utility
 * @param {Function} deps.saveDb - saveDb utility
 * @param {number} workerId
 * @param {number} totalAmount - Total cash given to worker
 * @param {number} debtDeduction - Total portion to apply to outstanding debts
 * @param {string} paymentMethod
 * @param {string|null} referenceNumber
 * @param {string|null} notes
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @returns {Promise<Object>}
 */
module.exports = async function recordWorkerPayment(
  deps,
  workerId,
  totalAmount,
  debtDeduction,
  paymentMethod,
  referenceNumber,
  notes,
  user = "system",
  qr = null,
) {
  const {
    paymentRepo,
    historyRepo,
    debtRepo,
    debtService,
    interestService,
    farmSessionDefaultSessionId,
    updateDb,
    saveDb,
  } = deps;

  // 1. Basic validation
  if (totalAmount <= 0) throw new Error("Total amount must be greater than zero");
  if (debtDeduction < 0) throw new Error("Debt deduction cannot be negative");
  if (debtDeduction > totalAmount) throw new Error("Debt deduction cannot exceed total amount");

  const roundedTotal = roundToTwo(totalAmount);
  const roundedDeduction = roundToTwo(debtDeduction);

  // 2. Kunin ang default session
  const defaultSessionId = await farmSessionDefaultSessionId();
  if (!defaultSessionId) throw new Error("No active session found");

  // 3. I-accrue ang interes ng LAHAT ng active debts ng worker bago ang deduction
  const activeDebts = await debtRepo.find({
    where: {
      worker: { id: workerId },
      session: { id: defaultSessionId },
      status: In(["pending", "partially_paid"]),
      deletedAt: null,
    },
  });

  const today = new Date();
  for (const debt of activeDebts) {
    await interestService.applyAccrual(debt, today, qr);
  }

  // 4. Get total outstanding debt balance (with session filter)
  const debtStats = await debtService.getStatisticsWithFilters({
    workerId,
  });
  const totalDebtBalance = roundToTwo(debtStats.totalBalance || 0);

  // 5. Get all pending/partially paid payments (FIFO)
  const pendingPayments = await paymentRepo.find({
    where: {
      worker: { id: workerId },
      status: In(["pending", "partially_paid"]),
      deletedAt: null,
    },
    order: { paymentDate: "ASC", createdAt: "ASC" },
  });

  // Compute total due
  const rawPaymentsDue = pendingPayments.reduce(
    (sum, p) => sum + (p.netPay - (p.amountPaid || 0)),
    0,
  );
  const totalPaymentsDue = roundToTwo(rawPaymentsDue);
  const totalDue = roundToTwo(totalPaymentsDue + totalDebtBalance);

  if (roundedTotal > totalDue) {
    throw new Error(
      `Total amount (${roundedTotal}) exceeds total due (${totalDue}). ` +
        `Outstanding debt: ${totalDebtBalance}, Payments due: ${totalPaymentsDue}`,
    );
  }

  // 6. ✅ ALLOCATE DEBT DEDUCTION ACROSS PAYMENTS USING UTILITY
  const getRemainingBalance = (payment) => {
    return roundToTwo(payment.netPay - (payment.amountPaid || 0));
  };

  const allocations = allocateDebtDeduction({
    workerId,
    deductionAmount: roundedDeduction,
    payments: pendingPayments,
    getRemainingBalance,
  });

  // 7. ✅ LOOP THROUGH ALLOCATIONS AND CALL deductFromWorker
  let totalActualDeducted = 0;
  const updatedPayments = [];

  for (const allocation of allocations) {
    const { paymentId, deduction } = allocation;

    // Find the payment object
    const payment = pendingPayments.find(p => p.id === paymentId);
    if (!payment) continue;

    // Call deductFromWorker for this specific payment
    const actualDeducted = await debtService.deductFromWorker(
      workerId,
      deduction,
      paymentId, // ✅ specific payment ID
      defaultSessionId,
      user,
      qr,
    );

    totalActualDeducted = roundToTwo(totalActualDeducted + actualDeducted);

    if (actualDeducted < deduction) {
      logger.warn(
        `[recordWorkerPayment] Partial debt deduction for payment #${paymentId}: ` +
        `only ${actualDeducted} of ${deduction} deducted.`
      );
    }

    // Update payment with actual debt deduction
    const newDebtDed = roundToTwo((payment.debtDeductionTotal || 0) + actualDeducted);
    const newNetPay = roundToTwo(payment.grossPay - (payment.manualDeduction || 0) - newDebtDed);

    // Determine status based on amount paid
    const currentPaid = payment.amountPaid || 0;
    let newStatus;
    if (currentPaid >= newNetPay) {
      newStatus = "completed";
    } else if (currentPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }

    payment.debtDeductionTotal = newDebtDed;
    payment.netPay = newNetPay;
    payment.status = newStatus;
    payment.lastPaymentDate = new Date();
    payment.updatedAt = new Date();

    await updateDb(paymentRepo, payment, {
      queryRunner: qr,
      skipSignal: false,
    });

    // Create history entry for debt deduction
    if (actualDeducted > 0) {
      const debtHistory = historyRepo.create({
        payment,
        actionType: "debt_deduction",
        changedField: "debtDeductionTotal",
        oldValue: (payment.debtDeductionTotal - actualDeducted).toString(),
        newValue: payment.debtDeductionTotal.toString(),
        notes: `Debt deduction applied: ${actualDeducted} from bulk payment. ${notes || ""}`,
        performedBy: user,
        referenceNumber: referenceNumber,
      });
      await saveDb(historyRepo, debtHistory, { queryRunner: qr });
      await auditLogger.logCreate("PaymentHistory", debtHistory.id, debtHistory, user);
    }

    updatedPayments.push({
      id: payment.id,
      allocatedDeduction: deduction,
      actualDeducted: actualDeducted,
      newStatus: payment.status,
    });
  }

  // 8. Distribute remaining cash (if any)
  let remainingCash = roundToTwo(roundedTotal - totalActualDeducted);

  for (const payment of pendingPayments) {
    if (remainingCash <= 0) break;

    const remaining = roundToTwo(payment.netPay - (payment.amountPaid || 0));
    if (remaining <= 0) continue;

    const cashToApply = Math.min(remainingCash, remaining);
    remainingCash = roundToTwo(remainingCash - cashToApply);

    const newAmountPaid = roundToTwo((payment.amountPaid || 0) + cashToApply);

    let newStatus;
    if (newAmountPaid >= payment.netPay) {
      newStatus = "completed";
    } else if (newAmountPaid > 0) {
      newStatus = "partially_paid";
    } else {
      newStatus = "pending";
    }

    payment.amountPaid = newAmountPaid;
    payment.status = newStatus;
    payment.lastPaymentDate = new Date();
    payment.updatedAt = new Date();

    await updateDb(paymentRepo, payment, {
      queryRunner: qr,
      skipSignal: false,
    });

    if (cashToApply > 0) {
      const cashHistory = historyRepo.create({
        payment,
        actionType: "payment_recorded",
        changedField: "amountPaid",
        oldValue: (payment.amountPaid - cashToApply).toString(),
        newValue: payment.amountPaid.toString(),
        oldAmount: payment.amountPaid - cashToApply,
        newAmount: payment.amountPaid,
        notes: `Part of bulk worker payment. Cash applied: ${cashToApply}. ${notes || ""}`,
        performedBy: user,
        referenceNumber: referenceNumber,
      });
      await saveDb(historyRepo, cashHistory, { queryRunner: qr });
      await auditLogger.logCreate("PaymentHistory", cashHistory.id, cashHistory, user);
    }

    // Update updatedPayments list if this payment wasn't already included
    const existing = updatedPayments.find(p => p.id === payment.id);
    if (existing) {
      existing.cashToApply = cashToApply;
    } else {
      updatedPayments.push({
        id: payment.id,
        allocatedDeduction: 0,
        actualDeducted: 0,
        cashToApply: cashToApply,
        newStatus: payment.status,
      });
    }
  }

  return {
    success: true,
    totalAmount: roundedTotal,
    debtDeducted: totalActualDeducted,
    cashDistributed: roundedTotal - totalActualDeducted,
    remainingCash: remainingCash,
    totalPaymentsDue,
    totalDebtBalance,
    paymentsUpdated: updatedPayments.length,
    details: updatedPayments,
  };
};
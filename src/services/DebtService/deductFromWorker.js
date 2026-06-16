// services/debt/deductFromWorker.js
const { In } = require("typeorm");
const auditLogger = require("../../utils/auditLogger");
const { roundToTwo } = require("./utils");

/**
 * Deduct an amount from worker's active debts (FIFO by dueDate)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {import("typeorm").Repository} deps.historyRepo
 * @param {import("typeorm").Repository} deps.paymentRepo
 * @param {Object} deps.debtPaymentService - DebtPaymentService instance
 * @param {Function} deps.updateDb - updateDb utility
 * @param {Function} deps.saveDb - saveDb utility
 * @param {number} workerId
 * @param {number} amount
 * @param {number} paymentId
 * @param {number} sessionId
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @returns {Promise<number>} total deducted amount
 */
module.exports = async function deductFromWorker(
  deps,
  workerId,
  amount,
  paymentId,
  sessionId,
  user = "system",
  qr = null,
) {
  const {
    debtRepo,
    historyRepo,
    paymentRepo,
    debtPaymentService,
    updateDb,
    saveDb,
  } = deps;

  const Debt = require("../../entities/Debt");
  const DebtHistory = require("../../entities/DebtHistory");
  const Payment = require("../../entities/Payment");

  const payment = await paymentRepo.findOne({ where: { id: paymentId } });
  if (!payment) {
    throw new Error(`Payment with ID ${paymentId} not found`);
  }

  const activeDebts = await debtRepo.find({
    where: {
      worker: { id: workerId },
      session: { id: sessionId },
      status: In(["pending", "partially_paid"]),
      deletedAt: null,
    },
    order: { dueDate: "ASC" },
  });

  let remaining = amount;
  let totalDeducted = 0;

  for (const debt of activeDebts) {
    if (remaining <= 0) break;
    const deductAmount = Math.min(remaining, debt.balance);
    if (deductAmount <= 0) continue;

    const oldBalance = debt.balance;
    debt.balance = roundToTwo(debt.balance - deductAmount);
    remaining = roundToTwo(remaining - deductAmount);
    totalDeducted = roundToTwo(totalDeducted + deductAmount);

    if (debt.balance === 0) {
      debt.status = "paid";
    } else if (debt.status !== "partially_paid") {
      debt.status = "partially_paid";
    }
    debt.updatedAt = new Date();
    await updateDb(debtRepo, debt, { queryRunner: qr, skipSignal: true });

    // ✅ GUMAWA NG DEBTPAYMENT gamit ang DebtPaymentService
    try {
      await debtPaymentService.create(
        {
          paymentId: payment.id,
          debtId: debt.id,
          amount: roundToTwo(deductAmount),
          previousBalance: roundToTwo(oldBalance),
          newBalance: debt.balance,
          notes: `Deducted from payment #${paymentId}`,
        },
        user,
        qr,
      );
    } catch (err) {
      console.error(`[DebtService] Failed to create DebtPayment for debt #${debt.id}:`, err);
      throw new Error(`Failed to create DebtPayment: ${err.message}`);
    }

    // ✅ GUMAWA NG DEBTHISTORY (walang payment)
    const history = historyRepo.create({
      debt,
      amountPaid: roundToTwo(deductAmount),
      previousBalance: roundToTwo(oldBalance),
      newBalance: debt.balance,
      transactionType: "payment",
      notes: `Payment #${paymentId} deducted from debt`,
      performedBy: user,
      transactionDate: new Date(),
    });
    await saveDb(historyRepo, history, { queryRunner: qr });
    await auditLogger.logCreate("DebtHistory", history.id, history, user);
  }

  if (remaining > 0) {
    console.warn(
      `[DebtService] Only ${totalDeducted} of ${amount} deducted. ` +
        `Remaining: ${remaining}. Worker: ${workerId}, Session: ${sessionId}`,
    );
  }

  return totalDeducted;
};
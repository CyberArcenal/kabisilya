// services/payment/recordPayment.js

const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { In } = require("typeorm");
const { roundToTwo } = require("./utils");

/**
 * Record a payment transaction (partial or full) for an existing payment
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.paymentRepo
 * @param {import("typeorm").Repository} deps.historyRepo
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {Object} deps.debtService - DebtService instance
 * @param {Object} deps.interestService - InterestAccrualService instance
 * @param {Function} deps.updateDb - updateDb utility
 * @param {Function} deps.saveDb - saveDb utility
 * @param {number} paymentId
 * @param {Object} recordData - { amountPaid, applyToDebt, paymentMethod, referenceNumber, notes }
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @returns {Promise<Object>}
 */
module.exports = async function recordPayment(
  deps,
  paymentId,
  recordData,
  user = "system",
  qr = null,
) {
  const {
    paymentRepo,
    historyRepo,
    debtRepo,
    debtService,
    interestService,
    updateDb,
    saveDb,
  } = deps;

  // 1. Get payment with relations
  const payment = await paymentRepo.findOne({
    where: { id: paymentId, deletedAt: null },
    relations: ["worker", "pitak", "session"],
  });
  if (!payment) throw new Error(`Payment #${paymentId} not found`);

  // 2. Validate
  if (payment.status === "cancelled") {
    throw new Error("Cannot record payment for a cancelled payment");
  }
  if (payment.status === "completed") {
    throw new Error("Payment is already completed");
  }

  const { amountPaid, applyToDebt, paymentMethod, referenceNumber, notes } =
    recordData;

  if (!amountPaid || amountPaid <= 0) {
    throw new Error("Amount paid must be greater than zero");
  }

  const newAmountPaid = (payment.amountPaid || 0) + amountPaid;
  if (newAmountPaid > payment.grossPay) {
    throw new Error(
      `Total amount paid (${newAmountPaid}) exceeds gross pay (${payment.grossPay})`,
    );
  }

  if (applyToDebt < 0 || applyToDebt > amountPaid) {
    throw new Error("Apply to debt amount must be between 0 and amount paid");
  }

  // 3. Calculate new totals
  const oldAmountPaid = payment.amountPaid || 0;
  const oldDebtDeduction = payment.debtDeductionTotal || 0;
  const newDebtDeduction = oldDebtDeduction + applyToDebt;

  const manualDeduction = payment.manualDeduction || 0;
  const newNetPay = payment.grossPay - manualDeduction - newDebtDeduction;
  if (newNetPay < 0) {
    throw new Error("Net pay cannot be negative after debt deduction");
  }

  // ✅ 4. ACCRUE INTEREST BEFORE DEBT DEDUCTION (kung may applyToDebt)
  if (applyToDebt > 0) {
    const workerId = payment.worker.id;
    const sessionId = payment.session.id;

    // Kunin ang mga active debts ng worker sa session
    const activeDebts = await debtRepo.find({
      where: {
        worker: { id: workerId },
        session: { id: sessionId },
        status: In(["pending", "partially_paid"]),
        deletedAt: null,
      },
    });

    const today = new Date();
    for (const debt of activeDebts) {
      await interestService.applyAccrual(debt, today, qr);
    }
  }

  // 5. Update payment
  payment.amountPaid = newAmountPaid;
  payment.lastPaymentDate = new Date();
  payment.debtDeductionTotal = newDebtDeduction;
  payment.netPay = newNetPay;
  payment.paymentMethod = paymentMethod || payment.paymentMethod;
  payment.referenceNumber = referenceNumber || payment.referenceNumber;
  payment.notes = notes
    ? payment.notes
      ? payment.notes + "\n" + notes
      : notes
    : payment.notes;
  payment.status =
    newAmountPaid >= payment.grossPay ? "completed" : "partially_paid";
  payment.updatedAt = new Date();

  await updateDb(paymentRepo, payment, { queryRunner: qr });

  // 6. Deduct from debts if applyToDebt > 0
  let actualDeducted = 0;
  if (applyToDebt > 0) {
    actualDeducted = await debtService.deductFromWorker(
      payment.worker.id,
      applyToDebt,
      payment.id,
      payment.session.id,
      user,
      qr,
    );
    if (actualDeducted < applyToDebt) {
      logger.warn(
        `[recordPayment] Only ${actualDeducted} of ${applyToDebt} could be deducted from debts for payment #${paymentId}`,
      );
    }
  }

  // 7. Create PaymentHistory entry
  const history = historyRepo.create({
    payment,
    actionType: "payment_recorded",
    changedField: "amountPaid",
    oldValue: oldAmountPaid.toString(),
    newValue: newAmountPaid.toString(),
    oldAmount: oldAmountPaid,
    newAmount: newAmountPaid,
    notes: `Recorded payment of ${amountPaid}, applied ${actualDeducted} to debt`,
    performedBy: user,
    referenceNumber: referenceNumber,
  });
  await saveDb(historyRepo, history, { queryRunner: qr });
  await auditLogger.logCreate("PaymentHistory", history.id, history, user);

  // 8. Audit log
  await auditLogger.logUpdate(
    "Payment",
    payment.id,
    { amountPaid: oldAmountPaid },
    { amountPaid: newAmountPaid },
    user,
  );

  return payment;
};

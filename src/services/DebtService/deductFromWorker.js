// services/debt/deductFromWorker.js
const { In } = require("typeorm");
const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { roundToTwo } = require("./utils");

/**
 * Deduct an amount from worker's active debts (FIFO by dueDate)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {import("typeorm").Repository} deps.historyRepo
 * @param {import("typeorm").Repository} deps.paymentRepo
 * @param {import("typeorm").Repository} deps.debtPaymentRepo   // ✅ added
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
    debtPaymentRepo, // ✅ new dependency
    debtPaymentService,
    updateDb,
    saveDb,
  } = deps;

  const Debt = require("../../entities/Debt");
  const DebtHistory = require("../../entities/DebtHistory");
  const Payment = require("../../entities/Payment");

  // ---------- LOG ENTRY ----------
  logger.info(`[deductFromWorker] Called with:`, {
    workerId,
    amount,
    paymentId,
    sessionId,
    user,
    hasQr: !!qr,
  });

  // 1. Get payment
  const payment = await paymentRepo.findOne({ where: { id: paymentId } });
  if (!payment) {
    logger.error(`[deductFromWorker] Payment #${paymentId} not found`);
    throw new Error(`Payment with ID ${paymentId} not found`);
  }
  logger.debug(`[deductFromWorker] Payment #${paymentId} found`);

  // 2. Get active debts (without session filter, as per your change)
  const activeDebts = await debtRepo.find({
    where: {
      worker: { id: workerId },
      status: In(["pending", "partially_paid"]),
      deletedAt: null,
    },
    order: { dueDate: "ASC" },
  });

  logger.debug(
    `[deductFromWorker] Found ${activeDebts.length} active debts for worker ${workerId}`,
  );
  if (activeDebts.length > 0) {
    logger.debug(
      `[deductFromWorker] Debt IDs: ${activeDebts.map((d) => d.id).join(", ")}`,
    );
  } else {
    logger.warn(
      `[deductFromWorker] No active debts found for worker ${workerId}`,
    );
  }

  let remaining = amount;
  let totalDeducted = 0;

  for (const debt of activeDebts) {
    if (remaining <= 0) break;

    const deductAmount = Math.min(remaining, debt.balance);
    if (deductAmount <= 0) {
      logger.debug(
        `[deductFromWorker] Skipping debt #${debt.id} (balance ${debt.balance}) – no amount to deduct`,
      );
      continue;
    }

    logger.debug(
      `[deductFromWorker] Processing debt #${debt.id}, balance: ${debt.balance}, deduct: ${deductAmount}`,
    );

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

    // ✅ CHECK FOR EXISTING DEBTPAYMENT – CREATE OR UPDATE
    try {
      const existingDP = await debtPaymentRepo.findOne({
        where: {
          payment: { id: payment.id },
          debt: { id: debt.id },
          deletedAt: null,
        },
      });

      if (!existingDP) {
        // No existing record – create a new one
        logger.debug(
          `[deductFromWorker] No existing DebtPayment for payment #${payment.id}, debt #${debt.id} – creating`,
        );
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
        logger.debug(
          `[deductFromWorker] DebtPayment created successfully for debt #${debt.id}`,
        );
      } else {
        // Existing record – update by accumulating
        const oldAmount = parseFloat(existingDP.amount);
        const newTotal = roundToTwo(oldAmount + deductAmount);

        // Update the existing DebtPayment
        existingDP.amount = newTotal;
        existingDP.previousBalance = roundToTwo(oldBalance); // balance before this new deduction
        existingDP.newBalance = debt.balance; // balance after this new deduction
        existingDP.notes = (existingDP.notes || '') + `; additional ${deductAmount}`;

        // Save the updated DebtPayment using updateDb (which respects the transaction)
        await updateDb(debtPaymentRepo, existingDP, { queryRunner: qr });

        logger.info(
          `[deductFromWorker] Updated DebtPayment #${existingDP.id} for payment #${payment.id}, debt #${debt.id}: ` +
          `amount now ${newTotal} (added ${deductAmount})`,
        );
      }
    } catch (err) {
      logger.error(
        `[deductFromWorker] Failed to process DebtPayment for debt #${debt.id}:`,
        err,
      );
      throw new Error(`Failed to process DebtPayment: ${err.message}`);
    }

    // ✅ CREATE DEBTHISTORY
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
    logger.debug(
      `[deductFromWorker] DebtHistory #${history.id} created for debt #${debt.id}`,
    );
  }

  // ---------- FINAL CHECK ----------
  if (remaining > 0) {
    const msg =
      `Insufficient debt balance: requested ${amount}, only ${totalDeducted} deducted. ` +
      `Remaining: ${remaining}. Worker: ${workerId}, Session: ${sessionId}`;
    logger.error(`[deductFromWorker] ${msg}`);
    throw new Error(`[DebtService] ${msg}`);
  }

  logger.info(
    `[deductFromWorker] Successfully deducted ${totalDeducted} from worker ${workerId} across ${activeDebts.length} debts`,
  );
  return totalDeducted;
};
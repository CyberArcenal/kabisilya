// services/debtPayment/createFromPayment.js
//@ts-check

const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { roundToTwo, validateDebtPaymentData } = require("./utils");

/**
 * Create a DebtPayment from a Payment (salary deduction)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.debtPaymentRepo
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {import("typeorm").Repository} deps.paymentRepo
 * @param {Function} deps.saveDb - saveDb utility
 * @param {Object} data
 * @param {number} data.paymentId
 * @param {number} data.debtId
 * @param {number} data.amount
 * @param {number} data.previousBalance
 * @param {number} data.newBalance
 * @param {string} [data.notes]
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @returns {Promise<Object>} - Created DebtPayment
 */
module.exports = async function createFromPayment(
  deps,
  data,
  user = "system",
  qr = null,
) {
  const {
    debtPaymentRepo,
    debtRepo,
    paymentRepo,
    saveDb,
  } = deps;

  // Log entry
  logger.info(`[createFromPayment] Called with data:`, {
    paymentId: data.paymentId,
    debtId: data.debtId,
    amount: data.amount,
    previousBalance: data.previousBalance,
    newBalance: data.newBalance,
    notes: data.notes,
    user,
    hasQr: !!qr,
  });

  // 1. Validate
  if (!data.paymentId) throw new Error("paymentId is required");
  
  const validation = validateDebtPaymentData(data);
  if (!validation.valid) {
    logger.error(`[createFromPayment] Validation failed: ${validation.errors.join(", ")}`);
    throw new Error(`Invalid debt payment data: ${validation.errors.join(", ")}`);
  }

  // 2. Check if payment exists
  const payment = await paymentRepo.findOne({
    where: { id: data.paymentId, deletedAt: null },
  });
  if (!payment) {
    logger.error(`[createFromPayment] Payment #${data.paymentId} not found`);
    throw new Error(`Payment with ID ${data.paymentId} not found`);
  }
  logger.debug(`[createFromPayment] Payment #${data.paymentId} found`);

  // 3. Check if debt exists
  const debt = await debtRepo.findOne({
    where: { id: data.debtId, deletedAt: null },
  });
  if (!debt) {
    logger.error(`[createFromPayment] Debt #${data.debtId} not found`);
    throw new Error(`Debt with ID ${data.debtId} not found`);
  }
  logger.debug(`[createFromPayment] Debt #${data.debtId} found`);

  // 4. Check for duplicate (payment + debt pair)
  logger.debug(`[createFromPayment] Checking for existing DebtPayment with paymentId=${data.paymentId}, debtId=${data.debtId}`);
  const existing = await debtPaymentRepo.findOne({
    where: {
      payment: { id: data.paymentId },
      debt: { id: data.debtId },
      deletedAt: null,
    },
  });
  if (existing) {
    logger.warn(
      `[createFromPayment] DUPLICATE FOUND: DebtPayment #${existing.id} already exists for payment #${data.paymentId} and debt #${data.debtId}. ` +
      `Amount: ${existing.amount}, previousBalance: ${existing.previousBalance}, newBalance: ${existing.newBalance}`
    );
    throw new Error(
      `DebtPayment already exists for payment #${data.paymentId} and debt #${data.debtId}`,
    );
  }
  logger.debug(`[createFromPayment] No existing DebtPayment found, proceeding to create`);

  // 5. Create DebtPayment
  const debtPaymentData = {
    payment,
    debt,
    amount: roundToTwo(data.amount),
    previousBalance: roundToTwo(data.previousBalance),
    newBalance: roundToTwo(data.newBalance),
    notes: data.notes || `Deducted from payment #${data.paymentId}`,
    createdAt: new Date(),
  };

  logger.debug(`[createFromPayment] Creating DebtPayment with data:`, debtPaymentData);
  const debtPayment = debtPaymentRepo.create(debtPaymentData);
  const saved = await saveDb(debtPaymentRepo, debtPayment, { queryRunner: qr });
  
  await auditLogger.logCreate("DebtPayment", saved.id, saved, user);
  logger.info(`[createFromPayment] Successfully created DebtPayment #${saved.id} for payment #${data.paymentId} and debt #${data.debtId}, amount: ${data.amount}`);

  return saved;
};
// services/debtPayment/createDirect.js
//@ts-check

const auditLogger = require("../../utils/auditLogger");
const { logger } = require("../../utils/logger");
const { roundToTwo, validateDebtPaymentData } = require("./utils");

/**
 * Create a DebtPayment without a Payment (direct payment)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.debtPaymentRepo
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {Function} deps.saveDb - saveDb utility
 * @param {Object} data
 * @param {number} data.debtId
 * @param {number} data.amount
 * @param {number} data.previousBalance
 * @param {number} data.newBalance
 * @param {string} [data.notes]
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @returns {Promise<Object>} - Created DebtPayment
 */
module.exports = async function createDirect(
  deps,
  data,
  user = "system",
  qr = null,
) {
  const {
    debtPaymentRepo,
    debtRepo,
    saveDb,
  } = deps;

  // 1. Validate
  const validation = validateDebtPaymentData(data);
  if (!validation.valid) {
    throw new Error(`Invalid debt payment data: ${validation.errors.join(", ")}`);
  }

  // 2. Check if debt exists
  const debt = await debtRepo.findOne({
    where: { id: data.debtId, deletedAt: null },
  });
  if (!debt) {
    throw new Error(`Debt with ID ${data.debtId} not found`);
  }

  // 3. Create DebtPayment (walang payment)
  const debtPaymentData = {
    payment: null, // ← walang payment
    debt,
    amount: roundToTwo(data.amount),
    previousBalance: roundToTwo(data.previousBalance),
    newBalance: roundToTwo(data.newBalance),
    notes: data.notes || `Direct payment of ${data.amount} recorded`,
    createdAt: new Date(),
  };

  const debtPayment = debtPaymentRepo.create(debtPaymentData);
  const saved = await saveDb(debtPaymentRepo, debtPayment, { queryRunner: qr });
  
  await auditLogger.logCreate("DebtPayment", saved.id, saved, user);
  logger.info(`[DebtPayment] Created direct payment for debt #${data.debtId}: ₱${data.amount}`);

  return saved;
};
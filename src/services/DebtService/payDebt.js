// services/debt/payDebt.js
const auditLogger = require("../../utils/auditLogger");
const { roundToTwo } = require("./utils");

/**
 * Record a direct payment against a specific debt (without a Payment record)
 * @param {Object} deps - Dependencies
 * @param {import("typeorm").Repository} deps.debtRepo
 * @param {import("typeorm").Repository} deps.historyRepo
 * @param {Function} deps.updateDb - updateDb utility
 * @param {Function} deps.saveDb - saveDb utility
 * @param {number} id - debt ID
 * @param {number} amount - amount to pay
 * @param {string} user
 * @param {import("typeorm").QueryRunner|null} qr
 * @param {string|null} paymentMethod
 * @param {string|null} referenceNumber
 * @param {string|null} notes
 * @returns {Promise<Object>} updated debt
 */
module.exports = async function payDebt(
  deps,
  id,
  amount,
  user = "system",
  qr = null,
  paymentMethod = null,
  referenceNumber = null,
  notes = null,
) {
  const {
    debtRepo,
    historyRepo,
    updateDb,
    saveDb,
  } = deps;

  const Debt = require("../../entities/Debt");
  const DebtHistory = require("../../entities/DebtHistory");

  const debt = await debtRepo.findOne({ where: { id, deletedAt: null } });
  if (!debt) throw new Error(`Debt with ID ${id} not found`);
  if (amount <= 0) throw new Error("Payment amount must be positive");
  if (amount > debt.balance) {
    throw new Error(`Amount cannot exceed remaining balance of ${debt.balance}`);
  }

  const oldBalance = debt.balance;
  debt.balance = roundToTwo(debt.balance - amount);
  debt.updatedAt = new Date();
  if (debt.balance === 0) debt.status = "paid";
  else if (debt.status !== "partially_paid") debt.status = "partially_paid";

  await updateDb(debtRepo, debt, { queryRunner: qr });

  const history = historyRepo.create({
    debt,
    amountPaid: amount,
    previousBalance: oldBalance,
    newBalance: debt.balance,
    transactionType: "payment",
    paymentMethod,
    referenceNumber,
    notes: notes || `Payment of ${amount} recorded`,
    performedBy: user,
    transactionDate: new Date(),
  });
  await saveDb(historyRepo, history, { queryRunner: qr });
  await auditLogger.logCreate("DebtHistory", history.id, history, user);

  return debt;
};
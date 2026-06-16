// services/debtPayment/utils.js

/**
 * Round to two decimal places
 * @param {number} num
 * @returns {number}
 */
function roundToTwo(num) {
  if (num === undefined || num === null) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Validate debt payment data
 * @param {Object} data
 * @param {number} data.debtId
 * @param {number} data.amount
 * @param {number} data.previousBalance
 * @param {number} data.newBalance
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateDebtPaymentData(data) {
  const errors = [];
  
  if (!data.debtId) errors.push("debtId is required");
  if (data.amount === undefined || data.amount <= 0) {
    errors.push("amount must be greater than zero");
  }
  if (data.previousBalance === undefined) {
    errors.push("previousBalance is required");
  }
  if (data.newBalance === undefined) {
    errors.push("newBalance is required");
  }
  
  return { valid: errors.length === 0, errors };
}

module.exports = {
  roundToTwo,
  validateDebtPaymentData,
};
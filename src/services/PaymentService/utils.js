// services/payment/utils.js
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
 * Allocate debt deduction across multiple payments (FIFO - oldest first)
 * @param {Object} params
 * @param {number} params.workerId - Worker ID
 * @param {number} params.deductionAmount - Total amount to deduct from debts
 * @param {Array<Object>} params.payments - List of pending/partially paid payments
 * @param {Function} params.getRemainingBalance - Function to get remaining balance of a payment
 * @returns {Array<{paymentId: number, deduction: number}>} - Array of paymentId and deduction pairs
 */
function allocateDebtDeduction({ workerId, deductionAmount, payments, getRemainingBalance }) {
  if (deductionAmount <= 0) {
    return [];
  }

  // Filter payments with remaining balance > 0
  const paymentsWithBalance = payments
    .map(p => ({
      ...p,
      remaining: getRemainingBalance(p),
    }))
    .filter(p => p.remaining > 0);

  if (paymentsWithBalance.length === 0) {
    return [];
  }

  // Sort by paymentDate ASC, createdAt ASC (FIFO)
  paymentsWithBalance.sort((a, b) => {
    const dateA = new Date(a.paymentDate || a.createdAt);
    const dateB = new Date(b.paymentDate || b.createdAt);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const allocations = [];
  let remainingDeduction = roundToTwo(deductionAmount);

  for (const payment of paymentsWithBalance) {
    if (remainingDeduction <= 0) break;

    const deductAmount = Math.min(remainingDeduction, payment.remaining);

    if (deductAmount > 0) {
      allocations.push({
        paymentId: payment.id,
        deduction: roundToTwo(deductAmount),
        remainingBalance: payment.remaining,
      });
      remainingDeduction = roundToTwo(remainingDeduction - deductAmount);
    }
  }

  // If there's still remaining deduction but no more payments with balance
  if (remainingDeduction > 0) {
    console.warn(
      `[allocateDebtDeduction] Not enough payment balance to allocate full deduction. ` +
      `Remaining: ${remainingDeduction}, Allocated: ${deductionAmount - remainingDeduction}`
    );
  }

  return allocations;
}

module.exports = {
  roundToTwo,
  allocateDebtDeduction,
};
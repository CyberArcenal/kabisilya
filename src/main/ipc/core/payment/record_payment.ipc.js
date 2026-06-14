const paymentService = require("../../../../services/PaymentService");
const { logger } = require("../../../../utils/logger");

module.exports = async function recordPayment(params, queryRunner) {
  try {
    logger.info("IPC: recordPayment", { params });
    const { id, amountPaid, applyToDebt, paymentMethod, referenceNumber, notes } = params;
    if (!id) throw new Error("Payment ID required");
    if (!amountPaid || amountPaid <= 0) throw new Error("Valid amountPaid required");
    const result = await paymentService.recordPayment(
      id,
      { amountPaid, applyToDebt: applyToDebt || 0, paymentMethod, referenceNumber, notes },
      "system",
      queryRunner
    );
    return { status: true, message: "Payment recorded successfully", data: result };
  } catch (error) {
    logger.error("IPC: recordPayment error:", error);
    return { status: false, message: error.message, data: null };
  }
};
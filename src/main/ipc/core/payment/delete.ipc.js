
const paymentService = require("../../../../services/PaymentService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deletePayment(params, queryRunner) {
  try {
    logger.info("IPC: deletePayment", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await paymentService.delete(params.id, "system");
    return { status: true, message: "Payment cancelled", data: result };
  } catch (error) {
    logger.error("IPC: deletePayment error:", error);
    return { status: false, message: error.message || "Failed to delete payment", data: null };
  }
};
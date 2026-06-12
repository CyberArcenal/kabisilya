// src/main/ipc/payment/update.ipc.js
const paymentService = require("../../../../services/PaymentService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updatePayment(params, queryRunner) {
  try {
    logger.info("IPC: updatePayment", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await paymentService.update(params.id, params, "system");
    return { status: true, message: "Payment updated", data: result };
  } catch (error) {
    logger.error("IPC: updatePayment error:", error);
    return { status: false, message: error.message || "Failed to update payment", data: null };
  }
};
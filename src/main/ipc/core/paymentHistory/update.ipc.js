// src/main/ipc/paymentHistory/update.ipc.js
// @ts-check
const paymentHistoryService = require("../../../../services/PaymentHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updatePaymentHistory(params, queryRunner) {
  try {
    logger.info("IPC: updatePaymentHistory", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await paymentHistoryService.update(params.id, params, "system");
    return { status: true, message: "Payment history updated", data: result };
  } catch (error) {
    logger.error("IPC: updatePaymentHistory error:", error);
    return { status: false, message: error.message || "Failed to update payment history", data: null };
  }
};
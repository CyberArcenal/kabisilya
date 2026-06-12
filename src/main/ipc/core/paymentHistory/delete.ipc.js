// src/main/ipc/paymentHistory/delete.ipc.js
// @ts-check
const paymentHistoryService = require("../../../../services/PaymentHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deletePaymentHistory(params, queryRunner) {
  try {
    logger.info("IPC: deletePaymentHistory", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await paymentHistoryService.delete(params.id, "system");
    return { status: true, message: "Payment history deleted", data: result };
  } catch (error) {
    logger.error("IPC: deletePaymentHistory error:", error);
    return { status: false, message: error.message || "Failed to delete payment history", data: null };
  }
};
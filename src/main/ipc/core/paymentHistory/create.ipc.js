// src/main/ipc/paymentHistory/create.ipc.js
// @ts-check
const paymentHistoryService = require("../../../../services/PaymentHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createPaymentHistory(params, queryRunner) {
  try {
    logger.info("IPC: createPaymentHistory", { params });
    if (!params.paymentId) {
      return { status: false, message: "Missing paymentId", data: null };
    }
    const result = await paymentHistoryService.create(params, "system");
    return { status: true, message: "Payment history created", data: result };
  } catch (error) {
    logger.error("IPC: createPaymentHistory error:", error);
    return { status: false, message: error.message || "Failed to create payment history", data: null };
  }
};
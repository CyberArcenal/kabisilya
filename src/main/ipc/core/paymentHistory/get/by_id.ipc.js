// src/main/ipc/paymentHistory/get/by_id.ipc.js
// @ts-check

const paymentHistoryService = require("../../../../../services/PaymentHistoryService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentHistoryById(params) {
  try {
    logger.info("IPC: getPaymentHistoryById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const history = await paymentHistoryService.findById(params.id);
    return { status: true, message: "Payment history retrieved", data: history };
  } catch (error) {
    logger.error("IPC: getPaymentHistoryById error:", error);
    return { status: false, message: error.message || "Failed to retrieve payment history", data: null };
  }
};
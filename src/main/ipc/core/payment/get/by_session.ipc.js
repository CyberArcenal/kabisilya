// src/main/ipc/payment/get/by_session.ipc.js
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentsBySession(params) {
  try {
    logger.info("IPC: getPaymentsBySession", { params });
    if (!params.sessionId) return { status: false, message: "Missing sessionId", data: null };
    const payments = await paymentService.findAll({ ...params, sessionId: params.sessionId });
    return { status: true, message: "Payments retrieved", data: payments };
  } catch (error) {
    logger.error("IPC: getPaymentsBySession error:", error);
    return { status: false, message: error.message || "Failed to retrieve payments", data: null };
  }
};
// src/main/ipc/payment/get/by_pitak.ipc.js
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentsByPitak(params) {
  try {
    logger.info("IPC: getPaymentsByPitak", { params });
    if (!params.pitakId) return { status: false, message: "Missing pitakId", data: null };
    const payments = await paymentService.findAll({ ...params, pitakId: params.pitakId });
    return { status: true, message: "Payments retrieved", data: payments };
  } catch (error) {
    logger.error("IPC: getPaymentsByPitak error:", error);
    return { status: false, message: error.message || "Failed to retrieve payments", data: null };
  }
};
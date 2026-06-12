// src/main/ipc/payment/get/by_worker.ipc.js
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentsByWorker(params) {
  try {
    logger.info("IPC: getPaymentsByWorker", { params });
    if (!params.workerId) return { status: false, message: "Missing workerId", data: null };
    const payments = await paymentService.findAll({ ...params, workerId: params.workerId });
    return { status: true, message: "Payments retrieved", data: payments };
  } catch (error) {
    logger.error("IPC: getPaymentsByWorker error:", error);
    return { status: false, message: error.message || "Failed to retrieve payments", data: null };
  }
};
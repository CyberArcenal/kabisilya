// src/main/ipc/payment/get/all.ipc.js
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getAllPayments(params) {
  try {
    logger.info("IPC: getAllPayments", { params });
    const payments = await paymentService.findAll(params);
    return { status: true, message: "Payments retrieved", data: payments };
  } catch (error) {
    logger.error("IPC: getAllPayments error:", error);
    return { status: false, message: error.message || "Failed to retrieve payments", data: null };
  }
};
// src/main/ipc/payment/get/by_id.ipc.js
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentById(params) {
  try {
    logger.info("IPC: getPaymentById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const payment = await paymentService.findById(params.id);
    return { status: true, message: "Payment retrieved", data: payment };
  } catch (error) {
    logger.error("IPC: getPaymentById error:", error);
    return { status: false, message: error.message || "Failed to retrieve payment", data: null };
  }
};
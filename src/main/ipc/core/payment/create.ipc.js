// src/main/ipc/payment/create.ipc.js
const paymentService = require("../../../../services/PaymentService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createPayment(params, queryRunner) {
  try {
    logger.info("IPC: createPayment", { params });
    if (!params.workerId || !params.pitakId || !params.sessionId) {
      return { status: false, message: "Missing required fields: workerId, pitakId, sessionId", data: null };
    }
    const result = await paymentService.create(params, "system");
    return { status: true, message: "Payment created", data: result };
  } catch (error) {
    logger.error("IPC: createPayment error:", error);
    return { status: false, message: error.message || "Failed to create payment", data: null };
  }
};
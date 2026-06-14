//@ts-check
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPaymentStats(params) {
  try {
    logger.info("IPC: getPaymentStats", { params });
    const stats = await paymentService.getStatistics(params);
    return {
      status: true,
      message: "Payment statistics retrieved",
      data: stats,
    };
  } catch (error) {
    logger.error("IPC: getPaymentStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve payment statistics",
      data: null,
    };
  }
};
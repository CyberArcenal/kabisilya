// src/main/ipc/debt/get/stats.ipc.js
const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtStats(params) {
  try {
    logger.info("IPC: getDebtStats", { params });
    // Pass all filters (workerId, sessionId, status, dueDateStart, dueDateEnd, minAmount, maxAmount, search)
    const stats = await debtService.getStatisticsWithFilters(params);
    return { status: true, message: "Debt statistics retrieved", data: stats };
  } catch (error) {
    logger.error("IPC: getDebtStats error:", error);
    return { status: false, message: error.message || "Failed to retrieve stats", data: null };
  }
};
// src/main/ipc/debtHistory/get/by_id.ipc.js
const debtHistoryService = require("../../../../../services/DebtHistoryService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtHistoryById(params) {
  try {
    logger.info("IPC: getDebtHistoryById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const history = await debtHistoryService.findById(params.id);
    return { status: true, message: "Debt history retrieved", data: history };
  } catch (error) {
    logger.error("IPC: getDebtHistoryById error:", error);
    return { status: false, message: error.message || "Failed to retrieve debt history", data: null };
  }
};
// src/main/ipc/debtHistory/get/by_debt.ipc.js
const debtHistoryService = require("../../../../../services/DebtHistoryService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtHistoriesByDebt(params) {
  try {
    logger.info("IPC: getDebtHistoriesByDebt", { params });
    if (!params.debtId) return { status: false, message: "Missing debtId", data: null };
    const histories = await debtHistoryService.findAll({ ...params, debtId: params.debtId });
    return { status: true, message: "Debt histories retrieved", data: histories };
  } catch (error) {
    logger.error("IPC: getDebtHistoriesByDebt error:", error);
    return { status: false, message: error.message || "Failed to retrieve debt histories", data: null };
  }
};
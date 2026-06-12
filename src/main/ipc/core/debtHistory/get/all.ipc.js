// src/main/ipc/debtHistory/get/all.ipc.js
const debtHistoryService = require("../../../../../services/DebtHistoryService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getAllDebtHistories(params) {
  try {
    logger.info("IPC: getAllDebtHistories", { params });
    const histories = await debtHistoryService.findAll(params);
    return { status: true, message: "Debt histories retrieved", data: histories };
  } catch (error) {
    logger.error("IPC: getAllDebtHistories error:", error);
    return { status: false, message: error.message || "Failed to retrieve debt histories", data: null };
  }
};
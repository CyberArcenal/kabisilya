// src/main/ipc/debtHistory/update.ipc.js

const debtHistoryService = require("../../../../services/DebtHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updateDebtHistory(params, queryRunner) {
  try {
    logger.info("IPC: updateDebtHistory", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await debtHistoryService.update(params.id, params, "system");
    return { status: true, message: "Debt history updated", data: result };
  } catch (error) {
    logger.error("IPC: updateDebtHistory error:", error);
    return { status: false, message: error.message || "Failed to update debt history", data: null };
  }
};
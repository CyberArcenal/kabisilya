// src/main/ipc/debtHistory/delete.ipc.js

const debtHistoryService = require("../../../../services/DebtHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deleteDebtHistory(params, queryRunner) {
  try {
    logger.info("IPC: deleteDebtHistory", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await debtHistoryService.delete(params.id, "system");
    return { status: true, message: "Debt history deleted", data: result };
  } catch (error) {
    logger.error("IPC: deleteDebtHistory error:", error);
    return { status: false, message: error.message || "Failed to delete debt history", data: null };
  }
};
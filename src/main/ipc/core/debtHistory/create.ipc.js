// src/main/ipc/debtHistory/create.ipc.js

const debtHistoryService = require("../../../../services/DebtHistoryService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createDebtHistory(params, queryRunner) {
  try {
    logger.info("IPC: createDebtHistory", { params });
    if (!params.debtId) {
      return { status: false, message: "Missing debtId", data: null };
    }
    const result = await debtHistoryService.create(params, "system");
    return { status: true, message: "Debt history created", data: result };
  } catch (error) {
    logger.error("IPC: createDebtHistory error:", error);
    return { status: false, message: error.message || "Failed to create debt history", data: null };
  }
};
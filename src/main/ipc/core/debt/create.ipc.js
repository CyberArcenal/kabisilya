// src/main/ipc/debt/create.ipc.js

const debtService = require("../../../../services/DebtService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createDebt(params, queryRunner) {
  try {
    logger.info("IPC: createDebt", { params });
    if (!params.workerId || !params.sessionId || params.amount === undefined) {
      return { status: false, message: "Missing required fields: workerId, sessionId, amount", data: null };
    }
    const result = await debtService.create(params, "system");
    return { status: true, message: "Debt created successfully", data: result };
  } catch (error) {
    logger.error("IPC: createDebt error:", error);
    return { status: false, message: error.message || "Failed to create debt", data: null };
  }
};
// src/main/ipc/debt/update.ipc.js

const debtService = require("../../../../services/DebtService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updateDebt(params, queryRunner) {
  try {
    logger.info("IPC: updateDebt", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await debtService.update(params.id, params, "system");
    return { status: true, message: "Debt updated successfully", data: result };
  } catch (error) {
    logger.error("IPC: updateDebt error:", error);
    return { status: false, message: error.message || "Failed to update debt", data: null };
  }
};
// src/main/ipc/debt/delete.ipc.js

const debtService = require("../../../../services/DebtService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deleteDebt(params, queryRunner) {
  try {
    logger.info("IPC: deleteDebt", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await debtService.delete(params.id, "system");
    return { status: true, message: "Debt cancelled successfully", data: result };
  } catch (error) {
    logger.error("IPC: deleteDebt error:", error);
    return { status: false, message: error.message || "Failed to delete debt", data: null };
  }
};
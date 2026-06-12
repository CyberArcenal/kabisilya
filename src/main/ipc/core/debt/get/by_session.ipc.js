// src/main/ipc/debt/get/by_session.ipc.js
const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtsBySession(params) {
  try {
    logger.info("IPC: getDebtsBySession", { params });
    if (!params.sessionId) return { status: false, message: "Missing sessionId", data: null };
    const debts = await debtService.findAll({ ...params, sessionId: params.sessionId });
    return { status: true, message: "Debts retrieved", data: debts };
  } catch (error) {
    logger.error("IPC: getDebtsBySession error:", error);
    return { status: false, message: error.message || "Failed to retrieve debts", data: null };
  }
};
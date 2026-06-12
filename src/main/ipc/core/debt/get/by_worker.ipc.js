// src/main/ipc/debt/get/by_worker.ipc.js
const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtsByWorker(params) {
  try {
    logger.info("IPC: getDebtsByWorker", { params });
    if (!params.workerId) return { status: false, message: "Missing workerId", data: null };
    const debts = await debtService.findAll({ ...params, workerId: params.workerId });
    return { status: true, message: "Debts retrieved", data: debts };
  } catch (error) {
    logger.error("IPC: getDebtsByWorker error:", error);
    return { status: false, message: error.message || "Failed to retrieve debts", data: null };
  }
};
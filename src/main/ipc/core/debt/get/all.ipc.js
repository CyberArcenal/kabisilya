// src/main/ipc/debt/get/all.ipc.js


const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getAllDebts(params) {
  try {
    logger.info("IPC: getAllDebts", { params });
    const debts = await debtService.findAll(params);
    return { status: true, message: "Debts retrieved", data: debts };
  } catch (error) {
    logger.error("IPC: getAllDebts error:", error);
    return { status: false, message: error.message || "Failed to retrieve debts", data: null };
  }
};
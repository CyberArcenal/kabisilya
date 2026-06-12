// src/main/ipc/debt/get/by_id.ipc.js

const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getDebtById(params) {
  try {
    logger.info("IPC: getDebtById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const debt = await debtService.findById(params.id);
    return { status: true, message: "Debt retrieved", data: debt };
  } catch (error) {
    logger.error("IPC: getDebtById error:", error);
    return { status: false, message: error.message || "Failed to retrieve debt", data: null };
  }
};
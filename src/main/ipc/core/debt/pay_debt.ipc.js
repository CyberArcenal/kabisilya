//@ts-check
const debtService = require("../../../../services/DebtService");
const { logger } = require("../../../../utils/logger");

module.exports = async function payDebt(params, queryRunner) {
  try {
    logger.info("IPC: payDebt", { params });
    const { id, amount, paymentMethod, referenceNumber, notes } = params;
    if (!id) throw new Error("Debt ID is required");
    if (!amount || amount <= 0) throw new Error("Valid amount is required");
    const result = await debtService.payDebt(id, amount, "system", queryRunner, paymentMethod, referenceNumber, notes);
    return { status: true, message: "Payment recorded successfully", data: result };
  } catch (error) {
    logger.error("IPC: payDebt error:", error);
    return { status: false, message: error.message || "Failed to record payment", data: null };
  }
};
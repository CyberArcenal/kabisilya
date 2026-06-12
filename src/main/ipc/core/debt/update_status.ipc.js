// src/main/ipc/debt/update_status.ipc
const debtService = require("../../../../services/DebtService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Debt ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await debtService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Debt status updated successfully",
      data: updated,
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
      data: null,
    };
  }
};
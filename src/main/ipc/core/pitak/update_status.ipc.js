// src/main/ipc/pitak/update_status.ipc
const pitakService = require("../../../../services/PitakService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Pitak ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await pitakService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Pitak status updated successfully",
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
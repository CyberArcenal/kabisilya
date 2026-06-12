// src/main/ipc/session/update_status.ipc
const sessionService = require("../../../../services/SessionService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Session ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await sessionService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Session status updated successfully",
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
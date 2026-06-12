// src/main/ipc/bukid/update_status.ipc

const bukidService = require("../../../../services/BukidService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Bukid ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await bukidService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Bukid status updated successfully",
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
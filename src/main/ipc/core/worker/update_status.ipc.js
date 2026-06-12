// src/main/ipc/worker/update_status.ipc
const workerService = require("../../../../services/WorkerService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Worker ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await workerService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Worker status updated successfully",
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
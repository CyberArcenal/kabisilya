// src/main/ipc/worker/delete.ipc.js
// @ts-check
const workerService = require("../../../../services/WorkerService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deleteWorker(params, queryRunner) {
  try {
    logger.info("IPC: deleteWorker", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await workerService.delete(params.id, "system");
    return { status: true, message: "Worker terminated", data: result };
  } catch (error) {
    logger.error("IPC: deleteWorker error:", error);
    return { status: false, message: error.message || "Failed to delete worker", data: null };
  }
};
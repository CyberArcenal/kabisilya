// src/main/ipc/worker/update.ipc.js
// @ts-check
const workerService = require("../../../../services/WorkerService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updateWorker(params, queryRunner) {
  try {
    logger.info("IPC: updateWorker", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await workerService.update(params.id, params, "system");
    return { status: true, message: "Worker updated", data: result };
  } catch (error) {
    logger.error("IPC: updateWorker error:", error);
    return { status: false, message: error.message || "Failed to update worker", data: null };
  }
};
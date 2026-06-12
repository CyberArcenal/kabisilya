// src/main/ipc/worker/create.ipc.js
// @ts-check
const workerService = require("../../../../services/WorkerService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createWorker(params, queryRunner) {
  try {
    logger.info("IPC: createWorker", { params });
    if (!params.name) {
      return { status: false, message: "Missing required field: name", data: null };
    }
    const result = await workerService.create(params, "system");
    return { status: true, message: "Worker created", data: result };
  } catch (error) {
    logger.error("IPC: createWorker error:", error);
    return { status: false, message: error.message || "Failed to create worker", data: null };
  }
};
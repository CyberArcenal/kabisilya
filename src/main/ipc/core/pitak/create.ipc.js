// src/main/ipc/pitak/create.ipc.js
// @ts-check
const pitakService = require("../../../../services/PitakService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createPitak(params, queryRunner) {
  try {
    logger.info("IPC: createPitak", { params });
    if (!params.bukidId) {
      return { status: false, message: "Missing required fields: bukidId, location", data: null };
    }
    const result = await pitakService.create(params, "system");
    return { status: true, message: "Pitak created", data: result };
  } catch (error) {
    logger.error("IPC: createPitak error:", error);
    return { status: false, message: error.message || "Failed to create pitak", data: null };
  }
};
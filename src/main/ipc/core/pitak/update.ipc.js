// src/main/ipc/pitak/update.ipc.js
// @ts-check
const pitakService = require("../../../../services/PitakService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updatePitak(params, queryRunner) {
  try {
    logger.info("IPC: updatePitak", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await pitakService.update(params.id, params, "system");
    return { status: true, message: "Pitak updated", data: result };
  } catch (error) {
    logger.error("IPC: updatePitak error:", error);
    return { status: false, message: error.message || "Failed to update pitak", data: null };
  }
};
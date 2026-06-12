// src/main/ipc/pitak/delete.ipc.js
// @ts-check
const pitakService = require("../../../../services/PitakService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deletePitak(params, queryRunner) {
  try {
    logger.info("IPC: deletePitak", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await pitakService.delete(params.id, "system");
    return { status: true, message: "Pitak archived", data: result };
  } catch (error) {
    logger.error("IPC: deletePitak error:", error);
    return { status: false, message: error.message || "Failed to delete pitak", data: null };
  }
};
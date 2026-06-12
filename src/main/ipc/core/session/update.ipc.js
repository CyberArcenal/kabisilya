// src/main/ipc/session/update.ipc.js
// @ts-check
const sessionService = require("../../../../services/SessionService");
const { logger } = require("../../../../utils/logger");

module.exports = async function updateSession(params, queryRunner) {
  try {
    logger.info("IPC: updateSession", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await sessionService.update(params.id, params, "system");
    return { status: true, message: "Session updated", data: result };
  } catch (error) {
    logger.error("IPC: updateSession error:", error);
    return { status: false, message: error.message || "Failed to update session", data: null };
  }
};
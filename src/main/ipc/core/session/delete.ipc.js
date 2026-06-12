// src/main/ipc/session/delete.ipc.js
// @ts-check
const sessionService = require("../../../../services/SessionService");
const { logger } = require("../../../../utils/logger");

module.exports = async function deleteSession(params, queryRunner) {
  try {
    logger.info("IPC: deleteSession", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await sessionService.delete(params.id, "system");
    return { status: true, message: "Session archived", data: result };
  } catch (error) {
    logger.error("IPC: deleteSession error:", error);
    return { status: false, message: error.message || "Failed to delete session", data: null };
  }
};
// src/main/ipc/session/get/by_id.ipc.js
const sessionService = require("../../../../../services/SessionService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getSessionById(params) {
  try {
    logger.info("IPC: getSessionById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const session = await sessionService.findById(params.id);
    return { status: true, message: "Session retrieved", data: session };
  } catch (error) {
    logger.error("IPC: getSessionById error:", error);
    return { status: false, message: error.message || "Failed to retrieve session", data: null };
  }
};
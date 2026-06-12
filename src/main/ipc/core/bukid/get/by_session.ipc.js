// src/main/ipc/bukid/get/by_session.ipc.js
const bukidService = require("../../../../../services/BukidService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getBukidsBySession(params) {
  try {
    logger.info("IPC: getBukidsBySession", { params });
    if (!params.sessionId) return { status: false, message: "Missing sessionId", data: null };
    const bukids = await bukidService.findAll({ ...params, sessionId: params.sessionId });
    return { status: true, message: "Bukids retrieved", data: bukids };
  } catch (error) {
    logger.error("IPC: getBukidsBySession error:", error);
    return { status: false, message: error.message || "Failed to retrieve bukids", data: null };
  }
};
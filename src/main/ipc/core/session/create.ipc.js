// src/main/ipc/session/create.ipc.js
// @ts-check
const sessionService = require("../../../../services/SessionService");
const { logger } = require("../../../../utils/logger");

module.exports = async function createSession(params, queryRunner) {
  try {
    logger.info("IPC: createSession", { params });
    if (!params.name || !params.year || !params.startDate) {
      return { status: false, message: "Missing required fields: name, year, startDate", data: null };
    }
    const result = await sessionService.create(params, "system");
    return { status: true, message: "Session created", data: result };
  } catch (error) {
    logger.error("IPC: createSession error:", error);
    return { status: false, message: error.message || "Failed to create session", data: null };
  }
};
// src/main/ipc/bukid/create.ipc.js
// @ts-check
const bukidService = require("../../../../services/BukidService");
const { logger } = require("../../../../utils/logger");

// @ts-ignore
module.exports = async function createBukid(params, queryRunner) {
  try {
    // @ts-ignore
    logger.info("IPC: createBukid", { params });
    if (!params.name || !params.sessionId) {
      return { status: false, message: "Missing required fields: name, sessionId", data: null };
    }
    const result = await bukidService.create(params, "system");
    return { status: true, message: "Bukid created successfully", data: result };
  } catch (error) {
    // @ts-ignore
    logger.error("IPC: createBukid error:", error);
    // @ts-ignore
    return { status: false, message: error.message || "Failed to create bukid", data: null };
  }
};
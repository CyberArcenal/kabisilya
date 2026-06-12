// src/main/ipc/bukid/update.ipc.js
// @ts-check
const bukidService = require("../../../../services/BukidService");
const { logger } = require("../../../../utils/logger");

// @ts-ignore
module.exports = async function updateBukid(params, queryRunner) {
  try {
    // @ts-ignore
    logger.info("IPC: updateBukid", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await bukidService.update(params.id, params, "system");
    return { status: true, message: "Bukid updated successfully", data: result };
  } catch (error) {
    // @ts-ignore
    logger.error("IPC: updateBukid error:", error);
    // @ts-ignore
    return { status: false, message: error.message || "Failed to update bukid", data: null };
  }
};
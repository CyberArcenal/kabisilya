// src/main/ipc/bukid/delete.ipc.js
// @ts-check
const bukidService = require("../../../../services/BukidService");
const { logger } = require("../../../../utils/logger");

// @ts-ignore
module.exports = async function deleteBukid(params, queryRunner) {
  try {
    // @ts-ignore
    logger.info("IPC: deleteBukid", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const result = await bukidService.delete(params.id, "system");
    return { status: true, message: "Bukid archived successfully", data: result };
  } catch (error) {
    // @ts-ignore
    logger.error("IPC: deleteBukid error:", error);
    // @ts-ignore
    return { status: false, message: error.message || "Failed to delete bukid", data: null };
  }
};
// src/main/ipc/bukid/get/by_id.ipc.js
const bukidService = require("../../../../../services/BukidService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getBukidById(params) {
  try {
    logger.info("IPC: getBukidById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const bukid = await bukidService.findById(params.id);
    return { status: true, message: "Bukid retrieved", data: bukid };
  } catch (error) {
    logger.error("IPC: getBukidById error:", error);
    return { status: false, message: error.message || "Failed to retrieve bukid", data: null };
  }
};
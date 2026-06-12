// src/main/ipc/bukid/get/all.ipc.js
// @ts-check

const bukidService = require("../../../../../services/BukidService");
const { logger } = require("../../../../../utils/logger");

// @ts-ignore
module.exports = async function getAllBukids(params) {
  try {
    // @ts-ignore
    logger.info("IPC: getAllBukids", { params });
    const bukids = await bukidService.findAll(params);
    return { status: true, message: "Bukids retrieved", data: bukids };
  } catch (error) {
    // @ts-ignore
    logger.error("IPC: getAllBukids error:", error);
    // @ts-ignore
    return { status: false, message: error.message || "Failed to retrieve bukids", data: null };
  }
};
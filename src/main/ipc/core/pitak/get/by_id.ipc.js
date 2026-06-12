// src/main/ipc/pitak/get/by_id.ipc.js
// @ts-check

const pitakService = require("../../../../../services/PitakService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPitakById(params) {
  try {
    logger.info("IPC: getPitakById", { params });
    if (!params.id) return { status: false, message: "Missing id", data: null };
    const pitak = await pitakService.findById(params.id);
    return { status: true, message: "Pitak retrieved", data: pitak };
  } catch (error) {
    logger.error("IPC: getPitakById error:", error);
    return { status: false, message: error.message || "Failed to retrieve pitak", data: null };
  }
};
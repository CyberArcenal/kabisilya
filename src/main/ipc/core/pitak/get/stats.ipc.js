// src/main/ipc/pitak/get/stats.ipc.js
// @ts-check

const pitakService = require("../../../../../services/PitakService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getPitakStats(params) {
  try {
    logger.info("IPC: getPitakStats", { params });
    const result = await pitakService.getStatisticsWithFilters(params);
    return { status: true, message: "Pitak statistics", data: result };
  } catch (error) {
    logger.error("IPC: getPitakStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

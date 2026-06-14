const bukidService = require("../../../../../services/BukidService");
const { logger } = require("../../../../../utils/logger");

module.exports = async function getBukidStats(params) {
  try {
    logger.info("IPC: getBukidStats", { params });
    const stats = await bukidService.getStatisticsWithFilters(params);
    return { status: true, message: "Bukid statistics retrieved", data: stats };
  } catch (error) {
    logger.error("IPC: getBukidStats error:", error);
    return { status: false, message: error.message || "Failed to retrieve stats", data: null };
  }
};
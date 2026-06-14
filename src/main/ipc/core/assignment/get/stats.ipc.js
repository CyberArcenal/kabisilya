// src/main/ipc/assignment/get/stats.ipc.js
const Assignment = require("../../../../../entities/Assignment");
const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

/**
 * Get assignment statistics (counts by status, total luwang)
 * @param {Object} params - { sessionId? }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAssignmentStats(params) {
  try {
    logger.info("IPC: getAssignmentStats", { params });

   const result = await assignmentService.getStatisticsWithFilters(params)

    return {
      status: true,
      message: "Assignment statistics retrieved",
      data: result,
    };
  } catch (error) {
    logger.error("IPC: getAssignmentStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

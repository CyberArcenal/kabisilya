// src/main/ipc/assignment/get/all.ipc.js
// @ts-check

const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");

/**
 * Get all assignments with optional filters
 * @param {Object} params - { workerId, pitakId, sessionId, status, startDate, endDate, page, limit, sortBy, sortOrder }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAllAssignments(params) {
  try {
    // @ts-ignore
    logger.info("IPC: getAllAssignments", { params });

    const assignments = await assignmentService.findAll(params);
    return {
      status: true,
      message: "Assignments retrieved successfully",
      data: assignments,
    };
  } catch (error) {
    // @ts-ignore
    logger.error("IPC: getAllAssignments error:", error);
    return {
      status: false,
      // @ts-ignore
      message: error.message || "Failed to retrieve assignments",
      data: null,
    };
  }
};
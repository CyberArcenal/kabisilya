// src/main/ipc/assignment/get/by_id.ipc.js
const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");

/**
 * Get assignment by ID
 * @param {Object} params - { id }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAssignmentById(params) {
  try {
    logger.info("IPC: getAssignmentById", { params });

    if (!params.id) {
      return { status: false, message: "Missing id", data: null };
    }

    const assignment = await assignmentService.findById(params.id);
    return {
      status: true,
      message: "Assignment retrieved successfully",
      data: assignment,
    };
  } catch (error) {
    logger.error("IPC: getAssignmentById error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve assignment",
      data: null,
    };
  }
};
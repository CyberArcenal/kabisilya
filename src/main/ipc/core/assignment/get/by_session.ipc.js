// src/main/ipc/assignment/get/by_session.ipc.js
const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");

/**
 * Get assignments by session ID
 * @param {Object} params - { sessionId, ...filters }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAssignmentsBySession(params) {
  try {
    logger.info("IPC: getAssignmentsBySession", { params });

    if (!params.sessionId) {
      return { status: false, message: "Missing sessionId", data: null };
    }

    const assignments = await assignmentService.findAll({ ...params, sessionId: params.sessionId });
    return {
      status: true,
      message: "Assignments retrieved successfully",
      data: assignments,
    };
  } catch (error) {
    logger.error("IPC: getAssignmentsBySession error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve assignments",
      data: null,
    };
  }
};
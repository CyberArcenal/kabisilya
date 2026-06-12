// src/main/ipc/assignment/get/by_pitak.ipc.js
const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");

/**
 * Get assignments by pitak ID
 * @param {Object} params - { pitakId, ...filters }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAssignmentsByPitak(params) {
  try {
    logger.info("IPC: getAssignmentsByPitak", { params });

    if (!params.pitakId) {
      return { status: false, message: "Missing pitakId", data: null };
    }

    const assignments = await assignmentService.findAll({ ...params, pitakId: params.pitakId });
    return {
      status: true,
      message: "Assignments retrieved successfully",
      data: assignments,
    };
  } catch (error) {
    logger.error("IPC: getAssignmentsByPitak error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve assignments",
      data: null,
    };
  }
};
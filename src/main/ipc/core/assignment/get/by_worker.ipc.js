// src/main/ipc/assignment/get/by_worker.ipc.js
const assignmentService = require("../../../../../services/Assignment");
const { logger } = require("../../../../../utils/logger");

/**
 * Get assignments by worker ID
 * @param {Object} params - { workerId, ...filters }
 * @returns {Promise<{status: boolean, message: string, data?: any}>}
 */
module.exports = async function getAssignmentsByWorker(params) {
  try {
    logger.info("IPC: getAssignmentsByWorker", { params });

    if (!params.workerId) {
      return { status: false, message: "Missing workerId", data: null };
    }

    const assignments = await assignmentService.findAll({ ...params, workerId: params.workerId });
    return {
      status: true,
      message: "Assignments retrieved successfully",
      data: assignments,
    };
  } catch (error) {
    logger.error("IPC: getAssignmentsByWorker error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve assignments",
      data: null,
    };
  }
};
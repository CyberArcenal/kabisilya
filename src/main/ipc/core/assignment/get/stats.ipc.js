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

    const assignmentRepo = AppDataSource.getRepository(Assignment);
    const queryBuilder = assignmentRepo.createQueryBuilder("assignment");

    if (params.sessionId) {
      queryBuilder.where("assignment.sessionId = :sessionId", {
        sessionId: params.sessionId,
      });
    }

    const totalCount = await queryBuilder.getCount();
    const statusCounts = await queryBuilder
      .select("assignment.status, COUNT(*) as count")
      .groupBy("assignment.status")
      .getRawMany();

    const totalLuwang = await queryBuilder
      .select("SUM(assignment.luwangCount)", "total")
      .getRawOne();

    const stats = {
      totalAssignments: totalCount,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      totalLuwang: parseFloat(totalLuwang?.total || 0),
    };

    return {
      status: true,
      message: "Assignment statistics retrieved",
      data: stats,
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

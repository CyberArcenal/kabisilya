// src/main/ipc/pitak/get/stats.ipc.js
// @ts-check

const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getPitakStats(params) {
  try {
    logger.info("IPC: getPitakStats", { params });

    const repo = AppDataSource.getRepository(Pitak);
    const queryBuilder = repo.createQueryBuilder("pitak");

    if (params.bukidId) {
      queryBuilder.where("pitak.bukidId = :bukidId", {
        bukidId: params.bukidId,
      });
    }

    const totalCount = await queryBuilder.getCount();
    const statusCounts = await queryBuilder
      .select("pitak.status, COUNT(*) as count")
      .groupBy("pitak.status")
      .getRawMany();

    const totalArea = await queryBuilder
      .select("SUM(pitak.areaSqm)", "totalArea")
      .getRawOne();

    const stats = {
      totalPitaks: totalCount,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      totalArea: parseFloat(totalArea?.totalArea || 0),
    };

    return { status: true, message: "Pitak statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getPitakStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

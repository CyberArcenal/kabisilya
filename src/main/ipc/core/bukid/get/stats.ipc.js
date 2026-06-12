// src/main/ipc/bukid/get/stats.ipc.js
const Bukid = require("../../../../../entities/Bukid");
const Pitak = require("../../../../../entities/Pitak");
const bukidService = require("../../../../../services/BukidService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getBukidStats(params) {
  try {
    logger.info("IPC: getBukidStats", { params });

    const bukidRepo = AppDataSource.getRepository(Bukid);
    const pitakRepo = AppDataSource.getRepository(Pitak);

    const totalBukids = await bukidRepo.count();
    const statusCounts = await bukidRepo
      .createQueryBuilder("bukid")
      .select("bukid.status, COUNT(*) as count")
      .groupBy("bukid.status")
      .getRawMany();

    // Count pitaks per bukid (optional)
    const pitakCounts = await pitakRepo
      .createQueryBuilder("pitak")
      .select("pitak.bukidId, COUNT(*) as count")
      .groupBy("pitak.bukidId")
      .getRawMany();

    const stats = {
      totalBukids,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      pitakDistribution: pitakCounts,
    };

    return { status: true, message: "Bukid statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getBukidStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

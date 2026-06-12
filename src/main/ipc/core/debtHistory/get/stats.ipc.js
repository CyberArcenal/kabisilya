// src/main/ipc/debtHistory/get/stats.ipc.js

const DebtHistory = require("../../../../../entities/DebtHistory");
const debtHistoryService = require("../../../../../services/DebtHistoryService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getDebtHistoryStats(params) {
  try {
    logger.info("IPC: getDebtHistoryStats", { params });

    const repo = AppDataSource.getRepository(DebtHistory);
    const queryBuilder = repo.createQueryBuilder("history");

    if (params.debtId) {
      queryBuilder.where("history.debtId = :debtId", { debtId: params.debtId });
    }

    const totalCount = await queryBuilder.getCount();
    const typeCounts = await queryBuilder
      .select("history.transactionType, COUNT(*) as count")
      .groupBy("history.transactionType")
      .getRawMany();

    const totalPaid = await queryBuilder
      .select("SUM(history.amountPaid)", "totalPaid")
      .where("history.transactionType = :type", { type: "payment" })
      .getRawOne();

    const stats = {
      totalEntries: totalCount,
      typeBreakdown: typeCounts.reduce((acc, row) => {
        acc[row.transactionType] = parseInt(row.count);
        return acc;
      }, {}),
      totalPayments: parseFloat(totalPaid?.totalPaid || 0),
    };

    return { status: true, message: "Debt history statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getDebtHistoryStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

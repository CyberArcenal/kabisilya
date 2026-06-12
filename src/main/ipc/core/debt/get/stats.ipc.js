// src/main/ipc/debt/get/stats.ipc.js

const Debt = require("../../../../../entities/Debt");
const debtService = require("../../../../../services/DebtService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getDebtStats(params) {
  try {
    logger.info("IPC: getDebtStats", { params });

    const debtRepo = AppDataSource.getRepository(Debt);
    const queryBuilder = debtRepo.createQueryBuilder("debt");

    if (params.sessionId) {
      queryBuilder.where("debt.sessionId = :sessionId", {
        sessionId: params.sessionId,
      });
    }

    const totalCount = await queryBuilder.getCount();
    const statusCounts = await queryBuilder
      .select("debt.status, COUNT(*) as count")
      .groupBy("debt.status")
      .getRawMany();

    const totalAmount = await queryBuilder
      .select("SUM(debt.amount)", "totalAmount")
      .getRawOne();
    const totalBalance = await queryBuilder
      .select("SUM(debt.balance)", "totalBalance")
      .getRawOne();

    const stats = {
      totalDebts: totalCount,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      totalAmount: parseFloat(totalAmount?.totalAmount || 0),
      totalBalance: parseFloat(totalBalance?.totalBalance || 0),
    };

    return { status: true, message: "Debt statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getDebtStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

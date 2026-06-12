// src/main/ipc/paymentHistory/get/stats.ipc.js
// @ts-check
const PaymentHistory = require("../../../../../entities/PaymentHistory");
const paymentHistoryService = require("../../../../../services/PaymentHistoryService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getPaymentHistoryStats(params) {
  try {
    logger.info("IPC: getPaymentHistoryStats", { params });

    const repo = AppDataSource.getRepository(PaymentHistory);
    const queryBuilder = repo.createQueryBuilder("history");

    if (params.paymentId) {
      queryBuilder.where("history.paymentId = :paymentId", {
        paymentId: params.paymentId,
      });
    }

    const totalCount = await queryBuilder.getCount();
    const actionCounts = await queryBuilder
      .select("history.actionType, COUNT(*) as count")
      .groupBy("history.actionType")
      .getRawMany();

    const stats = {
      totalEntries: totalCount,
      actionBreakdown: actionCounts.reduce((acc, row) => {
        acc[row.actionType] = parseInt(row.count);
        return acc;
      }, {}),
    };

    return { status: true, message: "Payment history statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getPaymentHistoryStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

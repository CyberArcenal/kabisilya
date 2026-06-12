// src/main/ipc/payment/get/stats.ipc.js
const Payment = require("../../../../../entities/Payment");
const paymentService = require("../../../../../services/PaymentService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getPaymentStats(params) {
  try {
    logger.info("IPC: getPaymentStats", { params });

    const repo = AppDataSource.getRepository(Payment);
    const queryBuilder = repo.createQueryBuilder("payment");

    if (params.sessionId) {
      queryBuilder.where("payment.sessionId = :sessionId", {
        sessionId: params.sessionId,
      });
    }

    const totalCount = await queryBuilder.getCount();
    const statusCounts = await queryBuilder
      .select("payment.status, COUNT(*) as count")
      .groupBy("payment.status")
      .getRawMany();

    const totals = await queryBuilder
      .select("SUM(payment.grossPay)", "totalGross")
      .addSelect("SUM(payment.netPay)", "totalNet")
      .addSelect("SUM(payment.manualDeduction)", "totalDeductions")
      .getRawOne();

    const stats = {
      totalPayments: totalCount,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      totalGross: parseFloat(totals?.totalGross || 0),
      totalNet: parseFloat(totals?.totalNet || 0),
      totalDeductions: parseFloat(totals?.totalDeductions || 0),
    };

    return { status: true, message: "Payment statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getPaymentStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

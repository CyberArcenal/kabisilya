// src/main/ipc/session/get/stats.ipc.js
const Assignment = require("../../../../../entities/Assignment");
const Debt = require("../../../../../entities/Debt");
const Payment = require("../../../../../entities/Payment");
const Session = require("../../../../../entities/Session");
const sessionService = require("../../../../../services/SessionService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getSessionStats(params) {
  try {
    logger.info("IPC: getSessionStats", { params });

    const sessionRepo = AppDataSource.getRepository(Session);
    const assignmentRepo = AppDataSource.getRepository(Assignment);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const debtRepo = AppDataSource.getRepository(Debt);

    const totalSessions = await sessionRepo.count();
    const statusCounts = await sessionRepo
      .createQueryBuilder("session")
      .select("session.status, COUNT(*) as count")
      .groupBy("session.status")
      .getRawMany();

    // If a specific sessionId is provided, get its detailed stats
    let sessionStats = null;
    if (params.sessionId) {
      const assignments = await assignmentRepo.count({
        where: { session: { id: params.sessionId } },
      });
      const payments = await paymentRepo.count({
        where: { session: { id: params.sessionId } },
      });
      const debts = await debtRepo.count({
        where: { session: { id: params.sessionId } },
      });

      sessionStats = {
        totalAssignments: assignments,
        totalPayments: payments,
        totalDebts: debts,
      };
    }

    const stats = {
      totalSessions,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      sessionDetails: sessionStats,
    };

    return { status: true, message: "Session statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getSessionStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

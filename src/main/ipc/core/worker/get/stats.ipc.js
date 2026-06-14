// src/main/ipc/worker/get/stats.ipc.js
const Assignment = require("../../../../../entities/Assignment");
const Debt = require("../../../../../entities/Debt");
const Payment = require("../../../../../entities/Payment");
const Worker = require("../../../../../entities/Worker");
const workerService = require("../../../../../services/WorkerService");
const { logger } = require("../../../../../utils/logger");
const { AppDataSource } = require("../../../../db/data-source");

module.exports = async function getWorkerStats(params) {
  try {
    logger.info("IPC: getWorkerStats", { params });

    const workerRepo = AppDataSource.getRepository(Worker);
    const assignmentRepo = AppDataSource.getRepository(Assignment);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const debtRepo = AppDataSource.getRepository(Debt);

    const totalWorkers = await workerRepo.count();
    const statusCounts = await workerRepo
      .createQueryBuilder("worker")
      .select("worker.status, COUNT(*) as count")
      .groupBy("worker.status")
      .getRawMany();

    // If a specific workerId is provided, get detailed stats
    let workerDetails = null;
    if (params.workerId) {
      const assignments = await assignmentRepo.count({
        where: { worker: { id: params.workerId } },
      });
      const payments = await paymentRepo.count({
        where: { worker: { id: params.workerId } },
      });
      const debts = await debtRepo.count({
        where: { worker: { id: params.workerId } },
      });
      const totalDebtBalance = await debtRepo
        .createQueryBuilder("debt")
        .where("debt.workerId = :workerId", { workerId: params.workerId })
        .select("SUM(debt.balance)", "total")
        .getRawOne();

      workerDetails = {
        totalAssignments: assignments,
        totalPayments: payments,
        totalDebts: debts,
        outstandingDebt: parseFloat(totalDebtBalance?.total || 0),
      };
    }

    const stats = {
      totalWorkers,
      statusBreakdown: statusCounts.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      workerDetails,
    };

    return { status: true, message: "Worker statistics", data: stats };
  } catch (error) {
    logger.error("IPC: getWorkerStats error:", error);
    return {
      status: false,
      message: error.message || "Failed to retrieve stats",
      data: null,
    };
  }
};

// src/main/ipc/workerPayment/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AppDataSource } = require("../../../db/data-source");
const workerService = require("../../../../services/WorkerService");
const paymentService = require("../../../../services/PaymentService");
const debtService = require("../../../../services/DebtService");
const debtHistoryService = require("../../../../services/DebtHistoryService"); // assume exists
const auditLogger = require("../../../../utils/auditLogger");

class WorkerPaymentHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllWorkerPayments = this.importHandler("./get/all.ipc");
    // WRITE
    this.payAll = this.importHandler("./payAll.ipc");
    this.payDebt = this.importHandler("./payDebt.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[WorkerPaymentHandler] Failed to load handler: ${path}`,
        error.message
      );
      return async () => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
      });
    }
  }

  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};

      if (logger) {
        logger.info(`WorkerPaymentHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllWorkerPayments":
          return await this.getAllWorkerPayments(params);
        case "payAll":
          return await this.handleWithTransaction(this.payAll, params);
        case "payDebt":
          return await this.handleWithTransaction(this.payDebt, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("WorkerPaymentHandler error:", error);
      if (logger) logger.error("WorkerPaymentHandler error:", error);
      return {
        status: false,
        message: error.message || "Internal server error",
        data: null,
      };
    }
  }

  async handleWithTransaction(handler, params) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await handler(params, queryRunner);
      if (result.status) await queryRunner.commitTransaction();
      else await queryRunner.rollbackTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

const workerPaymentHandler = new WorkerPaymentHandler();

ipcMain.handle(
  "workerPayment",
  withErrorHandling(
    workerPaymentHandler.handleRequest.bind(workerPaymentHandler),
    "IPC:workerPayment"
  )
);

module.exports = { WorkerPaymentHandler, workerPaymentHandler };
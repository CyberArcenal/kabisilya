// src/main/ipc/paymentHistory/index.ipc.js
// @ts-check
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class PaymentHistoryHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllPaymentHistories = this.importHandler("./get/all.ipc");
    this.getPaymentHistoryById = this.importHandler("./get/by_id.ipc");
    this.getPaymentHistoriesByPayment = this.importHandler(
      "./get/by_payment.ipc",
    );
    this.getPaymentHistoryStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createPaymentHistory = this.importHandler("./create.ipc");
    this.updatePaymentHistory = this.importHandler("./update.ipc");
    this.deletePaymentHistory = this.importHandler("./delete.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[PaymentHistoryHandler] Failed to load handler: ${path}`,
        error.message,
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
        logger.info(`PaymentHistoryHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllPaymentHistories":
          return await this.getAllPaymentHistories(params);
        case "getPaymentHistoryById":
          return await this.getPaymentHistoryById(params);
        case "getPaymentHistoriesByPayment":
          return await this.getPaymentHistoriesByPayment(params);
        case "getPaymentHistoryStats":
          return await this.getPaymentHistoryStats(params);
        case "createPaymentHistory":
          return await this.handleWithTransaction(
            this.createPaymentHistory,
            params,
          );
        case "updatePaymentHistory":
          return await this.handleWithTransaction(
            this.updatePaymentHistory,
            params,
          );
        case "deletePaymentHistory":
          return await this.handleWithTransaction(
            this.deletePaymentHistory,
            params,
          );
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("PaymentHistoryHandler error:", error);
      if (logger) logger.error("PaymentHistoryHandler error:", error);
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

  async logActivity(user_id, action, description, qr = null) {
    const { saveDb } = require("../../../../utils/dbUtils/dbActions");
    try {
      let activityRepo;
      if (qr) activityRepo = qr.manager.getRepository(AuditLog);
      else activityRepo = AppDataSource.getRepository(AuditLog);
      const activity = activityRepo.create({
        user: user_id,
        action,
        description,
        entity: "PaymentHistory",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log payment history activity:", error);
      if (logger) logger.warn("Failed to log payment history activity:", error);
    }
  }
}

const paymentHistoryHandler = new PaymentHistoryHandler();

ipcMain.handle(
  "paymentHistory",
  withErrorHandling(
    paymentHistoryHandler.handleRequest.bind(paymentHistoryHandler),
    "IPC:paymentHistory",
  ),
);

module.exports = { PaymentHistoryHandler, paymentHistoryHandler };

// src/main/ipc/payment/index.ipc.js
const { ipcMain } = require("electron");
const { AppDataSource } = require("../../../db/data-source");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");

class PaymentHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllPayments = this.importHandler("./get/all.ipc");
    this.getPaymentById = this.importHandler("./get/by_id.ipc");
    this.getPaymentsByWorker = this.importHandler("./get/by_worker.ipc");
    this.getPaymentsByPitak = this.importHandler("./get/by_pitak.ipc");
    this.getPaymentsBySession = this.importHandler("./get/by_session.ipc");
    this.getPaymentStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createPayment = this.importHandler("./create.ipc");
    this.updatePayment = this.importHandler("./update.ipc");
    this.deletePayment = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[PaymentHandler] Failed to load handler: ${path}`,
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
        logger.info(`PaymentHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllPayments":
          return await this.getAllPayments(params);
        case "getPaymentById":
          return await this.getPaymentById(params);
        case "getPaymentsByWorker":
          return await this.getPaymentsByWorker(params);
        case "getPaymentsByPitak":
          return await this.getPaymentsByPitak(params);
        case "getPaymentsBySession":
          return await this.getPaymentsBySession(params);
        case "getPaymentStats":
          return await this.getPaymentStats(params);
        case "createPayment":
          return await this.handleWithTransaction(this.createPayment, params);
        case "updatePayment":
          return await this.handleWithTransaction(this.updatePayment, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deletePayment":
          return await this.handleWithTransaction(this.deletePayment, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("PaymentHandler error:", error);
      if (logger) logger.error("PaymentHandler error:", error);
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
        entity: "Payment",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log payment activity:", error);
      if (logger) logger.warn("Failed to log payment activity:", error);
    }
  }
}

const paymentHandler = new PaymentHandler();

ipcMain.handle(
  "payment",
  withErrorHandling(
    paymentHandler.handleRequest.bind(paymentHandler),
    "IPC:payment",
  ),
);

module.exports = { PaymentHandler, paymentHandler };

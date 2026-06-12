// src/main/ipc/debt/index.ipc.js
const { ipcMain } = require("electron");
const { AppDataSource } = require("../../../db/data-source");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");

class DebtHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllDebts = this.importHandler("./get/all.ipc");
    this.getDebtById = this.importHandler("./get/by_id.ipc");
    this.getDebtsByWorker = this.importHandler("./get/by_worker.ipc");
    this.getDebtsBySession = this.importHandler("./get/by_session.ipc");
    this.getDebtStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createDebt = this.importHandler("./create.ipc");
    this.updateDebt = this.importHandler("./update.ipc");
    this.deleteDebt = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[DebtHandler] Failed to load handler: ${path}`,
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
        logger.info(`DebtHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllDebts":
          return await this.getAllDebts(params);
        case "getDebtById":
          return await this.getDebtById(params);
        case "getDebtsByWorker":
          return await this.getDebtsByWorker(params);
        case "getDebtsBySession":
          return await this.getDebtsBySession(params);
        case "getDebtStats":
          return await this.getDebtStats(params);
        case "createDebt":
          return await this.handleWithTransaction(this.createDebt, params);
        case "updateDebt":
          return await this.handleWithTransaction(this.updateDebt, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deleteDebt":
          return await this.handleWithTransaction(this.deleteDebt, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("DebtHandler error:", error);
      if (logger) logger.error("DebtHandler error:", error);
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
        entity: "Debt",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log debt activity:", error);
      if (logger) logger.warn("Failed to log debt activity:", error);
    }
  }
}

const debtHandler = new DebtHandler();

ipcMain.handle(
  "debt",
  withErrorHandling(debtHandler.handleRequest.bind(debtHandler), "IPC:debt"),
);

module.exports = { DebtHandler, debtHandler };

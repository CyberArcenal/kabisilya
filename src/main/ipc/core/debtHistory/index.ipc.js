// src/main/ipc/debtHistory/index.ipc.js
// @ts-check
const { ipcMain } = require("electron");
const { AppDataSource } = require("../../../db/data-source");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");

class DebtHistoryHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllDebtHistories = this.importHandler("./get/all.ipc");
    this.getDebtHistoryById = this.importHandler("./get/by_id.ipc");
    this.getDebtHistoriesByDebt = this.importHandler("./get/by_debt.ipc");
    this.getDebtHistoryStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createDebtHistory = this.importHandler("./create.ipc");
    this.updateDebtHistory = this.importHandler("./update.ipc");
    this.deleteDebtHistory = this.importHandler("./delete.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[DebtHistoryHandler] Failed to load handler: ${path}`,
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
        logger.info(`DebtHistoryHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllDebtHistories":
          return await this.getAllDebtHistories(params);
        case "getDebtHistoryById":
          return await this.getDebtHistoryById(params);
        case "getDebtHistoriesByDebt":
          return await this.getDebtHistoriesByDebt(params);
        case "getDebtHistoryStats":
          return await this.getDebtHistoryStats(params);
        case "createDebtHistory":
          return await this.handleWithTransaction(
            this.createDebtHistory,
            params,
          );
        case "updateDebtHistory":
          return await this.handleWithTransaction(
            this.updateDebtHistory,
            params,
          );
        case "deleteDebtHistory":
          return await this.handleWithTransaction(
            this.deleteDebtHistory,
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
      console.error("DebtHistoryHandler error:", error);
      if (logger) logger.error("DebtHistoryHandler error:", error);
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
        entity: "DebtHistory",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log debt history activity:", error);
      if (logger) logger.warn("Failed to log debt history activity:", error);
    }
  }
}

const debtHistoryHandler = new DebtHistoryHandler();

ipcMain.handle(
  "debtHistory",
  withErrorHandling(
    debtHistoryHandler.handleRequest.bind(debtHistoryHandler),
    "IPC:debtHistory",
  ),
);

module.exports = { DebtHistoryHandler, debtHistoryHandler };

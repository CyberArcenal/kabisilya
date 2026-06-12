// src/main/ipc/worker/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class WorkerHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllWorkers = this.importHandler("./get/all.ipc");
    this.getWorkerById = this.importHandler("./get/by_id.ipc");
    this.getWorkersByStatus = this.importHandler("./get/by_status.ipc");
    this.getWorkerStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createWorker = this.importHandler("./create.ipc");
    this.updateWorker = this.importHandler("./update.ipc");
    this.deleteWorker = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[WorkerHandler] Failed to load handler: ${path}`,
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
        logger.info(`WorkerHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllWorkers":
          return await this.getAllWorkers(params);
        case "getWorkerById":
          return await this.getWorkerById(params);
        case "getWorkersByStatus":
          return await this.getWorkersByStatus(params);
        case "getWorkerStats":
          return await this.getWorkerStats(params);
        case "createWorker":
          return await this.handleWithTransaction(this.createWorker, params);
        case "updateWorker":
          return await this.handleWithTransaction(this.updateWorker, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deleteWorker":
          return await this.handleWithTransaction(this.deleteWorker, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("WorkerHandler error:", error);
      if (logger) logger.error("WorkerHandler error:", error);
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
        entity: "Worker",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log worker activity:", error);
      if (logger) logger.warn("Failed to log worker activity:", error);
    }
  }
}

const workerHandler = new WorkerHandler();

ipcMain.handle(
  "worker",
  withErrorHandling(
    workerHandler.handleRequest.bind(workerHandler),
    "IPC:worker",
  ),
);

module.exports = { WorkerHandler, workerHandler };

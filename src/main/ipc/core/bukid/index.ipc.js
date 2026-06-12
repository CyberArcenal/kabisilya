// src/main/ipc/bukid/index.ipc.js
// @ts-check
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class BukidHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllBukids = this.importHandler("./get/all.ipc");
    this.getBukidById = this.importHandler("./get/by_id.ipc");
    this.getBukidsBySession = this.importHandler("./get/by_session.ipc");
    this.getBukidStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createBukid = this.importHandler("./create.ipc");
    this.updateBukid = this.importHandler("./update.ipc");
    this.deleteBukid = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
  }

  // @ts-ignore
  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[BukidHandler] Failed to load handler: ${path}`,
        // @ts-ignore
        error.message,
      );
      return async () => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
      });
    }
  }

  // @ts-ignore
  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};

      if (logger) {
        // @ts-ignore
        logger.info(`BukidHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllBukids":
          return await this.getAllBukids(params);
        case "getBukidById":
          return await this.getBukidById(params);
        case "getBukidsBySession":
          return await this.getBukidsBySession(params);
        case "getBukidStats":
          return await this.getBukidStats(params);
        case "createBukid":
          return await this.handleWithTransaction(this.createBukid, params);
        case "updateBukid":
          return await this.handleWithTransaction(this.updateBukid, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deleteBukid":
          return await this.handleWithTransaction(this.deleteBukid, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("BukidHandler error:", error);
      // @ts-ignore
      if (logger) logger.error("BukidHandler error:", error);
      return {
        status: false,
        // @ts-ignore
        message: error.message || "Internal server error",
        data: null,
      };
    }
  }

  // @ts-ignore
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

  // @ts-ignore
  async logActivity(user_id, action, description, qr = null) {
    const { saveDb } = require("../../../../utils/dbUtils/dbActions");
    try {
      let activityRepo;
      // @ts-ignore
      if (qr) activityRepo = qr.manager.getRepository(AuditLog);
      else activityRepo = AppDataSource.getRepository(AuditLog);
      const activity = activityRepo.create({
        user: user_id,
        action,
        description,
        entity: "Bukid",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log bukid activity:", error);
      // @ts-ignore
      if (logger) logger.warn("Failed to log bukid activity:", error);
    }
  }
}

const bukidHandler = new BukidHandler();

ipcMain.handle(
  "bukid",
  withErrorHandling(bukidHandler.handleRequest.bind(bukidHandler), "IPC:bukid"),
);

module.exports = { BukidHandler, bukidHandler };

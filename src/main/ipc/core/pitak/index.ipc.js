// src/main/ipc/pitak/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class PitakHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllPitaks = this.importHandler("./get/all.ipc");
    this.getPitakById = this.importHandler("./get/by_id.ipc");
    this.getPitaksByBukid = this.importHandler("./get/by_bukid.ipc");
    this.getPitakStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createPitak = this.importHandler("./create.ipc");
    this.updatePitak = this.importHandler("./update.ipc");
    this.deletePitak = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[PitakHandler] Failed to load handler: ${path}`,
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
        logger.info(`PitakHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllPitaks":
          return await this.getAllPitaks(params);
        case "getPitakById":
          return await this.getPitakById(params);
        case "getPitaksByBukid":
          return await this.getPitaksByBukid(params);
        case "getPitakStats":
          return await this.getPitakStats(params);
        case "createPitak":
          return await this.handleWithTransaction(this.createPitak, params);
        case "updatePitak":
          return await this.handleWithTransaction(this.updatePitak, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deletePitak":
          return await this.handleWithTransaction(this.deletePitak, params);
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("PitakHandler error:", error);
      if (logger) logger.error("PitakHandler error:", error);
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
        entity: "Pitak",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log pitak activity:", error);
      if (logger) logger.warn("Failed to log pitak activity:", error);
    }
  }
}

const pitakHandler = new PitakHandler();

ipcMain.handle(
  "pitak",
  withErrorHandling(pitakHandler.handleRequest.bind(pitakHandler), "IPC:pitak"),
);

module.exports = { PitakHandler, pitakHandler };

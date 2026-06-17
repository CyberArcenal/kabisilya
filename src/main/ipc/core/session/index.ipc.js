// src/main/ipc/session/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class SessionHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ
    this.getAllSessions = this.importHandler("./get/all.ipc");
    this.getSessionById = this.importHandler("./get/by_id.ipc");
    this.getActiveSession = this.importHandler("./get/active.ipc");
    this.getSessionStats = this.importHandler("./get/stats.ipc");

    // WRITE
    this.createSession = this.importHandler("./create.ipc");
    this.updateSession = this.importHandler("./update.ipc");
    this.deleteSession = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");
    this.copyFarmStructure = this.importHandler("./copy_farm_structure.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[SessionHandler] Failed to load handler: ${path}`,
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
        logger.info(`SessionHandler: ${method}`, { params });
      }

      switch (method) {
        case "getAllSessions":
          return await this.getAllSessions(params);
        case "getSessionById":
          return await this.getSessionById(params);
        case "getActiveSession":
          return await this.getActiveSession(params);
        case "getSessionStats":
          return await this.getSessionStats(params);
        case "createSession":
          return await this.handleWithTransaction(this.createSession, params);
        case "updateSession":
          return await this.handleWithTransaction(this.updateSession, params);
        case "updateStatus":
          return await this.handleWithTransaction(this.updateStatus, params);
        case "deleteSession":
          return await this.handleWithTransaction(this.deleteSession, params);
        case "copyFarmStructure":
          return await this.handleWithTransaction(
            this.copyFarmStructure,
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
      console.error("SessionHandler error:", error);
      if (logger) logger.error("SessionHandler error:", error);
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
        entity: "Session",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log session activity:", error);
      if (logger) logger.warn("Failed to log session activity:", error);
    }
  }
}

const sessionHandler = new SessionHandler();

ipcMain.handle(
  "session",
  withErrorHandling(
    sessionHandler.handleRequest.bind(sessionHandler),
    "IPC:session",
  ),
);

module.exports = { SessionHandler, sessionHandler };

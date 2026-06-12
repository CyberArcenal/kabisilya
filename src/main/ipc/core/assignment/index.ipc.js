// src/main/ipc/assignment/index.ipc.js
const { ipcMain } = require("electron");
const { withErrorHandling } = require("../../../../middlewares/errorHandler");
const { logger } = require("../../../../utils/logger");
const { AuditLog } = require("../../../../entities/AuditLog");
const { AppDataSource } = require("../../../db/data-source");

class AssignmentHandler {
  constructor() {
    this.initializeHandlers();
  }

  initializeHandlers() {
    // READ OPERATIONS
    this.getAllAssignments = this.importHandler("./get/all.ipc");
    this.getAssignmentById = this.importHandler("./get/by_id.ipc");
    this.getAssignmentsByWorker = this.importHandler("./get/by_worker.ipc");
    this.getAssignmentsByPitak = this.importHandler("./get/by_pitak.ipc");
    this.getAssignmentsBySession = this.importHandler("./get/by_session.ipc");
    this.getAssignmentStats = this.importHandler("./get/stats.ipc");

    // WRITE OPERATIONS
    this.createAssignment = this.importHandler("./create.ipc");
    this.updateAssignment = this.importHandler("./update.ipc");
    this.deleteAssignment = this.importHandler("./delete.ipc");
    this.updateStatus = this.importHandler("./update_status.ipc");

    this.createBulkAssignments = this.importHandler("./bulk/create.ipc");
  }

  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[AssignmentHandler] Failed to load handler: ${path}`,
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

      const enrichedParams = { ...params };

      if (logger) {
        logger.info(`AssignmentHandler: ${method}`, { params });
      }

      switch (method) {
        // READ
        case "getAllAssignments":
          return await this.getAllAssignments(enrichedParams);
        case "getAssignmentById":
          return await this.getAssignmentById(enrichedParams);
        case "getAssignmentsByWorker":
          return await this.getAssignmentsByWorker(enrichedParams);
        case "getAssignmentsByPitak":
          return await this.getAssignmentsByPitak(enrichedParams);
        case "getAssignmentsBySession":
          return await this.getAssignmentsBySession(enrichedParams);
        case "getAssignmentStats":
          return await this.getAssignmentStats(enrichedParams);
        case "createBulkAssignments":
          return await this.handleWithTransaction(
            this.createBulkAssignments,
            enrichedParams,
          );

        // WRITE (with transaction)
        case "createAssignment":
          return await this.handleWithTransaction(
            this.createAssignment,
            enrichedParams,
          );
        case "updateAssignment":
          return await this.handleWithTransaction(
            this.updateAssignment,
            enrichedParams,
          );
        case "updateStatus":
          return await this.handleWithTransaction(
            this.updateStatus,
            enrichedParams,
          );
        case "deleteAssignment":
          return await this.handleWithTransaction(
            this.deleteAssignment,
            enrichedParams,
          );

        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("AssignmentHandler error:", error);
      if (logger) logger.error("AssignmentHandler error:", error);
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
      if (result.status) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }
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
      if (qr) {
        activityRepo = qr.manager.getRepository(AuditLog);
      } else {
        activityRepo = AppDataSource.getRepository(AuditLog);
      }
      const activity = activityRepo.create({
        user: user_id,
        action,
        description,
        entity: "Assignment",
        timestamp: new Date(),
      });
      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log assignment activity:", error);
      if (logger) logger.warn("Failed to log assignment activity:", error);
    }
  }
}

const assignmentHandler = new AssignmentHandler();

ipcMain.handle(
  "assignment",
  withErrorHandling(
    assignmentHandler.handleRequest.bind(assignmentHandler),
    "IPC:assignment",
  ),
);

module.exports = { AssignmentHandler, assignmentHandler };

// src/subscribers/WorkerSubscriber.js
//@ts-check
const Worker = require("../entities/Worker");
const { WorkerStateTransitionService } = require("../stateTransitionService/Worker");
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class WorkerSubscriber {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.transitionService = new WorkerStateTransitionService(dataSource);
  }

  listenTo() {
    return Worker;
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('WorkerSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('WorkerSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    try {
      logSubscriberEvent('WorkerSubscriber', 'afterUpdate', entity, {
        oldStatus: databaseEntity?.status,
        newStatus: entity.status,
      });
      if (databaseEntity && databaseEntity.status === entity.status) return;
      const hydrated = await this._hydrateWorker(entity.id, queryRunner);
      if (!hydrated) return;
      switch (entity.status) {
        case "active":
          await this.transitionService.onActivate(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "inactive":
          await this.transitionService.onInactivate(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "on-leave":
          await this.transitionService.onLeave(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "terminated":
          await this.transitionService.onTerminate(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        default:
          logger.warn(`[WorkerSubscriber] Unhandled status: ${entity.status}`);
      }
    } catch (err) {
      logSubscriberError('WorkerSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async _hydrateWorker(workerId, queryRunner) {
    const workerRepo = queryRunner
      ? queryRunner.manager.getRepository(Worker)
      : this.dataSource.getRepository(Worker);
    const worker = await workerRepo.findOne({
      where: { id: workerId },
      relations: ["assignments", "debts"],
    });
    if (!worker) {
      logger.error(`[WorkerSubscriber] Worker #${workerId} not found`);
      return null;
    }
    return worker;
  }
}

module.exports = WorkerSubscriber;
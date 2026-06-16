// src/subscribers/SessionSubscriber.js
//@ts-check
const Session = require("../entities/Session");
const { SessionStateTransitionService } = require("../stateTransitionService/Session");
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class SessionSubscriber {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.transitionService = new SessionStateTransitionService(dataSource);
  }

  listenTo() {
    return Session;
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('SessionSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('SessionSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    try {
      logSubscriberEvent('SessionSubscriber', 'afterUpdate', entity, {
        oldStatus: databaseEntity?.status,
        newStatus: entity.status,
      });
      if (databaseEntity && databaseEntity.status === entity.status) return;
      const hydrated = await this._hydrateSession(entity.id, queryRunner);
      if (!hydrated) return;
      switch (entity.status) {
        case "active":
          await this.transitionService.onActivate(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "closed":
          await this.transitionService.onClose(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "archived":
          await this.transitionService.onArchive(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        default:
          logger.warn(`[SessionSubscriber] Unhandled status: ${entity.status}`);
      }
    } catch (err) {
      logSubscriberError('SessionSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async _hydrateSession(sessionId, queryRunner) {
    const sessionRepo = queryRunner
      ? queryRunner.manager.getRepository(Session)
      : this.dataSource.getRepository(Session);
    const session = await sessionRepo.findOne({
      where: { id: sessionId },
      relations: [],
    });
    if (!session) {
      logger.error(`[SessionSubscriber] Session #${sessionId} not found`);
      return null;
    }
    return session;
  }
}

module.exports = SessionSubscriber;
// src/subscribers/PitakSubscriber.js
//@ts-check
const Pitak = require("../entities/Pitak");
const { PitakStateTransitionService } = require("../stateTransitionService/Pitak");
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class PitakSubscriber {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.transitionService = new PitakStateTransitionService(dataSource);
  }

  listenTo() {
    return Pitak;
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('PitakSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('PitakSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    try {
      logSubscriberEvent('PitakSubscriber', 'afterUpdate', entity, {
        oldStatus: databaseEntity?.status,
        newStatus: entity.status,
      });
      if (databaseEntity && databaseEntity.status === entity.status) return;
      const hydrated = await this._hydratePitak(entity.id, queryRunner);
      if (!hydrated) return;
      switch (entity.status) {
        case "active":
          await this.transitionService.onActivate(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "completed":
          await this.transitionService.onComplete(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        case "cancelled":
          await this.transitionService.onCancelled(hydrated, databaseEntity?.status, "system", queryRunner);
          break;
        default:
          logger.warn(`[PitakSubscriber] Unhandled status: ${entity.status}`);
      }
    } catch (err) {
      logSubscriberError('PitakSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async _hydratePitak(pitakId, queryRunner) {
    const pitakRepo = queryRunner
      ? queryRunner.manager.getRepository(Pitak)
      : this.dataSource.getRepository(Pitak);
    const pitak = await pitakRepo.findOne({
      where: { id: pitakId },
      relations: ["assignments"],
    });
    if (!pitak) {
      logger.error(`[PitakSubscriber] Pitak #${pitakId} not found`);
      return null;
    }
    return pitak;
  }
}

module.exports = PitakSubscriber;
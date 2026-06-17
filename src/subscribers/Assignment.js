// src/subscribers/AssignmentSubscriber.js
//@ts-check
const Assignment = require("../entities/Assignment");
const { AssignmentStateTransitionService } = require("../stateTransitionService/Assignment");
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class AssignmentSubscriber {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.transitionService = new AssignmentStateTransitionService(dataSource);
  }

  listenTo() {
    return Assignment;
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('AssignmentSubscriber', 'afterInsert', entity, { status: entity.status });
      const hydrated = await this._hydrateAssignment(entity.id, queryRunner);
      if (!hydrated) return;
      const pitakId = hydrated.pitak?.id;
      const sessionId = hydrated.session?.id;
      if (pitakId && sessionId) {
        await this.transitionService.recalculateLuWangForPitakSession(pitakId, sessionId, "system", queryRunner);
      }
      await this.transitionService.onInitiated(hydrated, null, "system", queryRunner);
    } catch (err) {
      logSubscriberError('AssignmentSubscriber', 'afterInsert', err, { id: entity?.id });
      throw err;
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    try {
      const oldStatus = databaseEntity?.status;
      const newStatus = entity.status;
      logSubscriberEvent('AssignmentSubscriber', 'afterUpdate', entity, { oldStatus, newStatus });
      if (oldStatus !== newStatus) {
        const hydrated = await this._hydrateAssignment(entity.id, queryRunner);
        if (!hydrated) return;
        const pitakId = hydrated.pitak?.id;
        const sessionId = hydrated.session?.id;
        if (pitakId && sessionId && newStatus !== 'completed') {
          await this.transitionService.recalculateLuWangForPitakSession(pitakId, sessionId, "system", queryRunner);
        }
        switch (newStatus) {
          case "active":
            await this.transitionService.onActivate(hydrated, oldStatus, "system", queryRunner);
            break;
          case "completed":
            await this.transitionService.onComplete(hydrated, oldStatus, "system", queryRunner);
            break;
          case "cancelled":
            await this.transitionService.onCancel(hydrated, oldStatus, "system", queryRunner);
            break;
          case "initiated":
            await this.transitionService.onInitiated(hydrated, oldStatus, "system", queryRunner);
            break;
          default:
            logger.warn(`[AssignmentSubscriber] Unhandled status transition: ${oldStatus} -> ${newStatus}`);
        }
      }
    } catch (err) {
      logSubscriberError('AssignmentSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async afterRemove(event, { manager, queryRunner }) {
    const { databaseEntity, entityId } = event;
    try {
      logSubscriberEvent('AssignmentSubscriber', 'afterRemove', null, {
        id: entityId,
        pitakId: databaseEntity?.pitak?.id,
        sessionId: databaseEntity?.session?.id,
      });
      if (databaseEntity?.pitak?.id && databaseEntity?.session?.id) {
        await this.transitionService.recalculateLuWangForPitakSession(
          databaseEntity.pitak.id,
          databaseEntity.session.id,
          "system",
          queryRunner
        );
      }
    } catch (err) {
      logSubscriberError('AssignmentSubscriber', 'afterRemove', err, { id: entityId });
      throw err;
    }
  }

  async _hydrateAssignment(assignmentId, queryRunner) {
    const assignmentRepo = queryRunner
      ? queryRunner.manager.getRepository(Assignment)
      : this.dataSource.getRepository(Assignment);
    const assignment = await assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["worker", "pitak", "session"],
    });
    if (!assignment) {
      logger.error(`[AssignmentSubscriber] Assignment #${assignmentId} not found for hydration`);
      return null;
    }
    return assignment;
  }
}

module.exports = AssignmentSubscriber;
// src/subscribers/ReminderLog.js
//@ts-check
const NotificationLog = require("../entities/NotificationLog");
const { NotificationLogStateTransitionService } = require("../stateTransitionService/ReminderLog"); // tawag sa transition service
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class NotificationLogSubscriber {
  constructor() {
    this.transitionService = null;
  }

  async getTransitionService(dataSource) {
    if (!this.transitionService) {
      this.transitionService = new NotificationLogStateTransitionService(dataSource);
    }
    return this.transitionService;
  }

  listenTo() {
    return NotificationLog;
  }

  async beforeInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationLogSubscriber', 'beforeInsert', entity, {
        notificationId: entity.notificationId,
        status: entity.status,
      });
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'beforeInsert', err, { id: entity?.id });
      throw err;
    }
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationLogSubscriber', 'afterInsert', entity, {
        notificationId: entity.notificationId,
        status: entity.status,
      });
      // I-log ang queryRunner details para sa debugging
      logger.info(`[NotificationLogSubscriber] queryRunner details:`, {
        constructorName: queryRunner?.constructor?.name,
        hasAfterCommit: typeof queryRunner?.afterCommit,
        hasManager: !!queryRunner?.manager,
        isQueryRunner: queryRunner?.constructor?.name === "QueryRunner",
      });

      const service = await this.getTransitionService(manager.connection);
      if (service.onCreate) {
        await service.onCreate(entity, "system", queryRunner);
      }
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'afterInsert', err, { id: entity?.id });
      throw err;
    }
  }

  async beforeUpdate(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationLogSubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'beforeUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    try {
      const { entity } = event;
      logSubscriberEvent('NotificationLogSubscriber', 'afterUpdate', entity);
      const service = await this.getTransitionService(manager.connection);
      if (entity.status === "failed" && entity.retry_count < 3) {
        await service.onRetry(entity, "system", queryRunner);
      } else if (entity.status === "sent") {
        await service.onAcknowledge(entity, "system", queryRunner);
      }
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async beforeRemove(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationLogSubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'beforeRemove', err, { id: entity?.id });
      throw err;
    }
  }

  async afterRemove(event, { manager, queryRunner }) {
    try {
      const { entityId } = event;
      logSubscriberEvent('NotificationLogSubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('NotificationLogSubscriber', 'afterRemove', err, { id: event?.entityId });
      throw err;
    }
  }
}

module.exports = NotificationLogSubscriber;
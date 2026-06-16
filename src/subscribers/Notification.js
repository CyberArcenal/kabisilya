// src/subscribers/NotificationSubscriber.js
//@ts-check
const Notification = require("../entities/Notification");
const { NotificationStateTransitionService } = require("../stateTransitionService/Notification");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class NotificationSubscriber {
  constructor() {
    this.transitionService = null;
  }

  async getTransitionService(dataSource) {
    if (!this.transitionService) {
      this.transitionService = new NotificationStateTransitionService(dataSource);
    }
    return this.transitionService;
  }

  listenTo() {
    return Notification;
  }

  async beforeInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationSubscriber', 'beforeInsert', entity, {
        title: entity.title,
        type: entity.type,
      });
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'beforeInsert', err, { id: entity?.id });
      throw err;
    }
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationSubscriber', 'afterInsert', entity, {
        title: entity.title,
        type: entity.type,
      });
      const service = await this.getTransitionService(manager.connection);
      await service.onCreate(entity, "system", queryRunner);
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'afterInsert', err, { id: entity?.id });
      // Huwag mag-rethrow para hindi masira ang transaction
    }
  }

  async beforeUpdate(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationSubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'beforeUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    try {
      const { entity, databaseEntity } = event;
      logSubscriberEvent('NotificationSubscriber', 'afterUpdate', entity);
      const service = await this.getTransitionService(manager.connection);
      if (entity.isRead && !databaseEntity.isRead) {
        await service.onRead(entity, "system", queryRunner);
      }
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async beforeRemove(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('NotificationSubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'beforeRemove', err, { id: entity?.id });
      throw err;
    }
  }

  async afterRemove(event, { manager, queryRunner }) {
    try {
      const { entityId } = event;
      logSubscriberEvent('NotificationSubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('NotificationSubscriber', 'afterRemove', err, { id: event?.entityId });
      throw err;
    }
  }
}

module.exports = NotificationSubscriber;
// src/subscribers/AuditLogSubscriber.js
//@ts-check
const AuditLog = require("../entities/AuditLog");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class AuditLogSubscriber {
  listenTo() {
    return AuditLog;
  }

  async beforeInsert(entity) {
    try {
      logSubscriberEvent('AuditLogSubscriber', 'beforeInsert', entity);
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'beforeInsert', err, { id: entity?.id });
    }
  }

  async afterInsert(entity) {
    try {
      logSubscriberEvent('AuditLogSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async beforeUpdate(entity) {
    try {
      logSubscriberEvent('AuditLogSubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'beforeUpdate', err, { id: entity?.id });
    }
  }

  async afterUpdate(event) {
    try {
      const { entity } = event;
      logSubscriberEvent('AuditLogSubscriber', 'afterUpdate', entity);
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'afterUpdate', err);
    }
  }

  async beforeRemove(entity) {
    try {
      logSubscriberEvent('AuditLogSubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'beforeRemove', err, { id: entity?.id });
    }
  }

  async afterRemove(event) {
    try {
      const { entityId } = event;
      logSubscriberEvent('AuditLogSubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('AuditLogSubscriber', 'afterRemove', err);
    }
  }
}

module.exports = AuditLogSubscriber;
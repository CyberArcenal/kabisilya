// src/subscribers/SystemSettingSubscriber.js
//@ts-check
const { SystemSetting } = require("../entities/systemSettings");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class SystemSettingSubscriber {
  listenTo() {
    return SystemSetting;
  }

  async beforeInsert(entity) {
    try {
      logSubscriberEvent('SystemSettingSubscriber', 'beforeInsert', entity);
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'beforeInsert', err, { id: entity?.id });
    }
  }

  async afterInsert(entity) {
    try {
      logSubscriberEvent('SystemSettingSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async beforeUpdate(entity) {
    try {
      logSubscriberEvent('SystemSettingSubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'beforeUpdate', err, { id: entity?.id });
    }
  }

  async afterUpdate(event) {
    try {
      const { entity } = event;
      logSubscriberEvent('SystemSettingSubscriber', 'afterUpdate', entity);
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'afterUpdate', err);
    }
  }

  async beforeRemove(entity) {
    try {
      logSubscriberEvent('SystemSettingSubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'beforeRemove', err, { id: entity?.id });
    }
  }

  async afterRemove(event) {
    try {
      const { entityId } = event;
      logSubscriberEvent('SystemSettingSubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('SystemSettingSubscriber', 'afterRemove', err);
    }
  }
}

module.exports = SystemSettingSubscriber;
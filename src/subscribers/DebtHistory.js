// src/subscribers/DebtHistorySubscriber.js
//@ts-check
const DebtHistory = require("../entities/DebtHistory");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class DebtHistorySubscriber {
  listenTo() {
    return DebtHistory;
  }

  async beforeInsert(entity) {
    try {
      logSubscriberEvent('DebtHistorySubscriber', 'beforeInsert', entity);
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'beforeInsert', err, { id: entity?.id });
    }
  }

  async afterInsert(entity) {
    try {
      logSubscriberEvent('DebtHistorySubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async beforeUpdate(entity) {
    try {
      logSubscriberEvent('DebtHistorySubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'beforeUpdate', err, { id: entity?.id });
    }
  }

  async afterUpdate(event) {
    try {
      const { entity } = event;
      logSubscriberEvent('DebtHistorySubscriber', 'afterUpdate', entity);
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'afterUpdate', err);
    }
  }

  async beforeRemove(entity) {
    try {
      logSubscriberEvent('DebtHistorySubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'beforeRemove', err, { id: entity?.id });
    }
  }

  async afterRemove(event) {
    try {
      const { entityId } = event;
      logSubscriberEvent('DebtHistorySubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('DebtHistorySubscriber', 'afterRemove', err);
    }
  }
}

module.exports = DebtHistorySubscriber;
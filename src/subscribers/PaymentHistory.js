// src/subscribers/PaymentHistorySubscriber.js
const PaymentHistory = require("../entities/PaymentHistory");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class PaymentHistorySubscriber {
  listenTo() {
    return PaymentHistory;
  }

  async beforeInsert(entity) {
    try {
      logSubscriberEvent('PaymentHistorySubscriber', 'beforeInsert', entity);
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'beforeInsert', err, { id: entity?.id });
    }
  }

  async afterInsert(entity) {
    try {
      logSubscriberEvent('PaymentHistorySubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async beforeUpdate(entity) {
    try {
      logSubscriberEvent('PaymentHistorySubscriber', 'beforeUpdate', entity);
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'beforeUpdate', err, { id: entity?.id });
    }
  }

  async afterUpdate(event) {
    try {
      const { entity } = event;
      logSubscriberEvent('PaymentHistorySubscriber', 'afterUpdate', entity);
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'afterUpdate', err);
    }
  }

  async beforeRemove(entity) {
    try {
      logSubscriberEvent('PaymentHistorySubscriber', 'beforeRemove', entity);
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'beforeRemove', err, { id: entity?.id });
    }
  }

  async afterRemove(event) {
    try {
      const { entityId } = event;
      logSubscriberEvent('PaymentHistorySubscriber', 'afterRemove', null, { id: entityId });
    } catch (err) {
      logSubscriberError('PaymentHistorySubscriber', 'afterRemove', err);
    }
  }
}

module.exports = PaymentHistorySubscriber;
// src/subscribers/PaymentSubscriber.js
//@ts-check
const Payment = require("../entities/Payment");
const { PaymentStateTransitionService } = require("../stateTransitionService/Payment");
const { logger } = require("../utils/logger");
const { logSubscriberEvent, logSubscriberError } = require("../utils/subscriberLogger");

class PaymentSubscriber {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.transitionService = new PaymentStateTransitionService(dataSource);
  }

  listenTo() {
    return Payment;
  }

  async afterInsert(entity, { manager, queryRunner }) {
    try {
      logSubscriberEvent('PaymentSubscriber', 'afterInsert', entity);
    } catch (err) {
      logSubscriberError('PaymentSubscriber', 'afterInsert', err, { id: entity?.id });
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    try {
      logSubscriberEvent('PaymentSubscriber', 'afterUpdate', entity, {
        oldStatus: databaseEntity?.status,
        newStatus: entity.status,
      });
      if (databaseEntity && databaseEntity.status === entity.status) return;
      const hydrated = await this._hydratePayment(entity.id, queryRunner);
      if (!hydrated) return;
      switch (entity.status) {
        case "completed":
          await this.transitionService.onCompleted(hydrated, databaseEntity, "system", queryRunner);
          break;
        case "cancelled":
          await this.transitionService.onCancelled(hydrated, databaseEntity, "system", queryRunner);
          break;
        case "partially_paid":
          await this.transitionService.onPartiallyPaid(hydrated, databaseEntity, "system", queryRunner);
          break;
        default:
          logger.warn(`[PaymentSubscriber] Unhandled status: ${entity.status}`);
      }
    } catch (err) {
      logSubscriberError('PaymentSubscriber', 'afterUpdate', err, { id: entity?.id });
      throw err;
    }
  }

  async _hydratePayment(paymentId, queryRunner) {
    const paymentRepo = queryRunner
      ? queryRunner.manager.getRepository(Payment)
      : this.dataSource.getRepository(Payment);
    const payment = await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ["worker", "pitak", "session", "assignment"],
    });
    if (!payment) {
      logger.error(`[PaymentSubscriber] Payment #${paymentId} not found`);
      return null;
    }
    return payment;
  }
}

module.exports = PaymentSubscriber;
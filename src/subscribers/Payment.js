// src/subscribers/PaymentSubscriber.js
const Payment = require("../entities/Payment");
const { PaymentStateTransitionService } = require("../stateTransitionService/Payment");
const { logger } = require("../utils/logger");

// Helper para i-serialize ang entity nang ligtas (iwas circular reference)
function safeStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  }, 2);
}

console.log("[Subscriber] Loading PaymentSubscriber");

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
      logger.info("[PaymentSubscriber] afterInsert", {
        entity: JSON.parse(safeStringify(entity))
      });
    } catch (err) {
      logger.error("[PaymentSubscriber] afterInsert error", err);
    }
  }

  async afterUpdate(event, { manager, queryRunner }) {
    const { databaseEntity, entity } = event;
    if (!entity) return;
    
    logger.info("[PaymentSubscriber] afterUpdate", {
      id: entity.id,
      oldStatus: databaseEntity?.status,
      newStatus: entity.status,
      fullEntity: JSON.parse(safeStringify(entity)),
      oldEntity: databaseEntity ? JSON.parse(safeStringify(databaseEntity)) : null
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
  }

  async _hydratePayment(paymentId, queryRunner) {
    const paymentRepo = queryRunner ? queryRunner.manager.getRepository(Payment) : this.dataSource.getRepository(Payment);
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
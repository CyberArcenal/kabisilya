// src/stateTransitionServices/BukidStateTransitionService.js
//@ts-check
const pitakService = require("../services/PitakService");
const auditLogger = require("../utils/auditLogger");
const { logger } = require("../utils/logger");

class BukidStateTransitionService {
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  _getRepo(qr, entityClass) {
    if (qr) return qr.manager.getRepository(entityClass);
    return this.dataSource.getRepository(entityClass);
  }

  async onInitiated(bukid, oldStatus = null, user = "system", qr = null) {
    logger.info(`[BukidTransition] Bukid #${bukid.id} initiated.`);
  }

  async onActivate(bukid, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[BukidTransition] Activating bukid #${bukid.id}, old status: ${oldStatus}`,
    );
  }

  async onComplete(bukid, oldStatus = null, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.info(
      `[BukidTransition] Completing bukid #${bukid.id}, old status: ${oldStatus}`,
    );

    if (!bukid.pitaks || bukid.pitaks.length === 0) {
      logger.info(
        `[BukidTransition] Bukid #${bukid.id} has no pitaks, nothing to cascade.`,
      );
      return;
    }

    for (const pitak of bukid.pitaks) {
      if (pitak.status === "completed" || pitak.status === "cancelled") continue;
      try {
        await pitakService.updateStatus(pitak.id, "completed", user, qr);
      } catch (error) {
        logger.warn(
          `[BukidTransition] Skipping pitak #${pitak.id}: ${error.message}`,
        );
        throw error;
      }
      logger.info(
        `[BukidTransition] Bukid #${bukid.id} completion cascade finished.`,
      );
    }
  }

  async onCancelled(bukid, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[BukidTransition] Inactivating bukid #${bukid.id}, old status: ${oldStatus}`,
    );
  }
}

module.exports = { BukidStateTransitionService };

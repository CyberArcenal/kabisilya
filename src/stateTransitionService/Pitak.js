// src/stateTransitionServices/PitakStateTransitionService.js
//@ts-check
const auditLogger = require("../utils/auditLogger");
const { logger } = require("../utils/logger");
const { AssignmentStatus } = require("../entities/Assignment");
const assignmentService = require("../services/Assignment");

class PitakStateTransitionService {
  /**
   * @param {any} dataSource
   */
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * @param {{ manager: { getRepository: (arg0: any) => any; }; } | null} qr
   * @param {import("typeorm").EntitySchema<{ id: unknown; luwangCount: unknown; assignmentDate: unknown; status: unknown; notes: unknown; createdAt: unknown; deletedAt: unknown; updatedAt: unknown; }>} entityClass
   */
  _getRepo(qr, entityClass) {
    if (qr) return qr.manager.getRepository(entityClass);
    return this.dataSource.getRepository(entityClass);
  }

  /**
   * @param {{ id: any; }} pitak
   */
  async onActivate(pitak, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[PitakTransition] Activating pitak #${pitak.id}, old status: ${oldStatus}`,
    );
  }

  /**
   * @param {{ id: any; assignments: string | any[]; }} pitak
   */
  async onComplete(pitak, oldStatus = null, user = "system", qr = null) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.info(
      `[PitakTransition] Completing pitak #${pitak.id}, old status: ${oldStatus}`,
    );

    if (!pitak.assignments || pitak.assignments.length === 0) {
      logger.info(
        `[PitakTransition] Pitak #${pitak.id} has no assignments, nothing to cascade.`,
      );
      return;
    }

    if (!pitak.assignments || pitak.assignments.length === 0) {
      const errorMsg = `Cannot complete pitak #${pitak.id} (${pitak.location}) because it has no assignments.`;
      logger.error(`[PitakTransition] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    for (const assignment of pitak.assignments) {
      if (assignment.status === AssignmentStatus.COMPLETED || assignment.status === AssignmentStatus.CANCELLED) continue;
      try {
        // ✅ Tawagin ang service para sa validation at audit
        await assignmentService.updateStatus(
          assignment.id,
          AssignmentStatus.COMPLETED,
          user,
          qr,
        );
        logger.info(
          `[PitakTransition] Assignment #${assignment.id} completed via service.`,
        );
      } catch (error) {
        logger.error(
          `[PitakTransition] Failed to complete assignment #${assignment.id}:`,
          error.message,
        );
        throw error;
      }
    }
    logger.info(
      `[PitakTransition] Pitak #${pitak.id} completion cascade finished.`,
    );
  }

  /**
   * @param {{ id: any; }} pitak
   */
  async onCancelled(pitak, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[PitakTransition] Inactivating pitak #${pitak.id}, old status: ${oldStatus}`,
    );
  }
}

module.exports = { PitakStateTransitionService };

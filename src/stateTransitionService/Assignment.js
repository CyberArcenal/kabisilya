// src/stateTransitionServices/AssignmentStateTransitionService.js
//@ts-check
const auditLogger = require("../utils/auditLogger");
const { logger } = require("../utils/logger");
const notificationService = require("../services/Notification");
const emailSender = require("../channels/email.sender");
const smsSender = require("../channels/sms.sender");
const { farmRatePerLuwang, companyName } = require("../utils/settings/system");
const { AssignmentStatus } = require("../entities/Assignment");
const paymentService = require("../services/PaymentService");

class AssignmentStateTransitionService {
  /**
   * @param {any} dataSource
   */
  constructor(dataSource) {
    this.dataSource = dataSource;
  }

  /**
   * @param {{ manager: { getRepository: (arg0: any) => any; }; } | null} qr
   * @param {import("typeorm").EntitySchema<{ id: unknown; location: unknown; totalLuwang: unknown; layoutType: unknown; sideLengths: unknown; areaSqm: unknown; notes: unknown; status: unknown; createdAt: unknown; deletedAt: unknown; updatedAt: unknown; }> | import("typeorm").EntitySchema<{ id: unknown; luwangCount: unknown; assignmentDate: unknown; status: unknown; notes: unknown; createdAt: unknown; deletedAt: unknown; updatedAt: unknown; }> | import("typeorm").EntitySchema<{ id: unknown; grossPay: unknown; manualDeduction: unknown; netPay: unknown; status: unknown; paymentDate: unknown; paymentMethod: unknown; referenceNumber: unknown; periodStart: unknown; periodEnd: unknown; totalDebtDeduction: unknown; otherDeductions: unknown; deductionBreakdown: unknown; notes: unknown; createdAt: unknown; deletedAt: unknown; updatedAt: unknown; idempotencyKey: unknown; amountPaid: unknown; lastPaymentDate: unknown; debtDeductionTotal: unknown; }>} entityClass
   */
  _getRepo(qr, entityClass) {
    if (qr) return qr.manager.getRepository(entityClass);
    return this.dataSource.getRepository(entityClass);
  }

  /**
   * @param {any} pitakId
   * @param {any} sessionId
   */
  async recalculateLuWangForPitakSession(
    pitakId,
    sessionId,
    user = "system",
    qr = null,
  ) {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    const Pitak = require("../entities/Pitak");
    const Assignment = require("../entities/Assignment");
    const pitakRepo = this._getRepo(qr, Pitak);
    const assignmentRepo = this._getRepo(qr, Assignment);

    const pitak = await pitakRepo.findOne({
      where: { id: pitakId, deletedAt: null },
    });
    if (!pitak) {
      logger.error(`Pitak ${pitakId} not found during luwang recalculation`);
      return;
    }

    const totalLuwang = parseFloat(pitak.totalLuwang) || 0;
    const activeAssignments = await assignmentRepo.find({
      where: {
        pitak: { id: pitakId },
        session: { id: sessionId },
        status: "active",
        deletedAt: null,
      },
    });

    const count = activeAssignments.length;
    if (count === 0) return;

    const luwangPerWorker = totalLuwang / count;
    const newLuWang = Math.round(luwangPerWorker * 100) / 100;

    for (const assignment of activeAssignments) {
      if (assignment.luwangCount !== newLuWang) {
        const oldValue = assignment.luwangCount;
        assignment.luwangCount = newLuWang;
        assignment.updatedAt = new Date();
        await updateDb(assignmentRepo, assignment, {
          queryRunner: qr,
          skipSignal: true,
        });
        await auditLogger.logUpdate(
          "Assignment",
          assignment.id,
          { luwangCount: oldValue },
          { luwangCount: newLuWang },
          user,
        );
        logger.info(
          `[AssignmentTransition] Assignment #${assignment.id} luwangCount updated from ${oldValue} to ${newLuWang}`,
        );
      }
    }
  }

  /**
   * @param {{ id: any; }} assignment
   */
  async onInitiated(assignment, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[AssignmentTransition] Assignment #${assignment.id} initiated.`,
    );
  }

  /**
   * @param {{ id: any; }} assignment
   */
  async onActivate(assignment, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[AssignmentTransition] Activating assignment #${assignment.id}, old status: ${oldStatus}`,
    );

    // Send notification to worker about new assignment
    await this._notifyAssignmentActivation(assignment, qr);
  }

  /**
   * @param {{ id: any; luwangCount: number; worker: any; pitak: any; session: any; assignmentDate: any; }} assignment
   */
  async onComplete(assignment, oldStatus = null, user = "system", qr = null) {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    logger.info(
      `[AssignmentTransition] Completing assignment #${assignment.id}, old status: ${oldStatus}`,
    );

    try {
      const rate = await farmRatePerLuwang();
      const grossPay = assignment.luwangCount * rate;
      const netPay = grossPay;

      const paymentData = {
        worker: assignment.worker,
        pitak: assignment.pitak,
        session: assignment.session,
        assignment: assignment,
        grossPay,
        netPay,
        status: "pending",
        paymentDate: null,
        periodStart: assignment.assignmentDate,
        periodEnd: assignment.assignmentDate,
        notes: `Auto-generated from completed assignment #${assignment.id}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedPayment = await paymentService.create(paymentData, user, qr);

      logger.info(
        `[AssignmentTransition] Created payment #${savedPayment.id} for assignment #${assignment.id}`,
      );
    } catch (error) {
      logger.error(
        `[AssignmentTransition] Failed to create payment for assignment #${assignment.id}:`,
        error,
      );
      throw error;
    }

    await this._notifyRelevantParties(assignment, "completed", oldStatus, qr);
  }

  /**
   * @param {{ id: any; }} assignment
   */
  async onCancel(assignment, oldStatus = null, user = "system", qr = null) {
    logger.info(
      `[AssignmentTransition] Cancelling assignment #${assignment.id}, old status: ${oldStatus}`,
    );
    await this._notifyRelevantParties(assignment, "cancelled", oldStatus, qr);
  }

  /**
   * @param {{ id: any; worker?: any; luwangCount?: any; }} assignment
   * @param {string} action
   */
  async _notifyRelevantParties(
    assignment,
    action,
    oldStatus = null,
    qr = null,
  ) {
    if (!assignment.worker) return;
    const worker = assignment.worker;
    const company = await companyName();

    const subject = `Assignment ${action} – #${assignment.id}`;
    let textBody = `Dear ${worker.name},\n\nYour assignment #${assignment.id} has been ${action}.`;
    if (action === "completed") {
      const rate = await farmRatePerLuwang();
      textBody += `\nLuWang: ${assignment.luwangCount} – payment ₱${assignment.luwangCount * rate} initiated.`;
    }
    const htmlBody = textBody.replace(/\n/g, "<br>");

    if (worker.email) {
      try {
        await emailSender.send(
          worker.email,
          subject,
          htmlBody,
          textBody,
          {},
          true,
        );
      } catch (error) {
        logger.error(`[Notification] Email failed:`, error);
      }
    }
    if (worker.contact) {
      try {
        await smsSender.send(
          worker.contact,
          `Assignment #${assignment.id} has been ${action}.`,
        );
      } catch (error) {
        logger.error(`[Notification] SMS failed:`, error);
      }
    }
    try {
      await notificationService.create(
        {
          userId: worker.id,
          title: `Assignment ${action}`,
          message: `Assignment #${assignment.id} has been ${action}.`,
          type: action === "cancelled" ? "warning" : "info",
          metadata: { assignmentId: assignment.id },
        },
        "system",
        qr, // pass queryRunner to notification service
      );
    } catch (error) {
      logger.error(`[Notification] In-app notification failed:`, error);
    }
  }

  /**
   * Send notification (email, SMS, in-app) when a worker is assigned to a pitak.
   * Includes bukid name and pitak location.
   */
  async _notifyAssignmentActivation(assignment, qr = null) {
    if (!assignment.worker) {
      logger.warn(
        `[AssignmentTransition] No worker for assignment #${assignment.id} – activation notification skipped`,
      );
      return;
    }

    const worker = assignment.worker;
    const pitak = assignment.pitak;
    const bukid = pitak?.bukid;
    const company = await companyName();

    const bukidName = bukid?.name || "Unknown Bukid";
    const pitakLocation = pitak?.location || "Unknown Plot";

    const subject = `New Assignment – #${assignment.id}`;
    let textBody = `Dear ${worker.name},\n\n`;
    textBody += `You have been assigned to:\n`;
    textBody += `• Farm: ${bukidName}\n`;
    textBody += `• Plot: ${pitakLocation}\n`;
    textBody += `Assignment Date: ${new Date(assignment.assignmentDate).toLocaleDateString()}\n\n`;
    textBody += `Please contact the farm manager for further instructions.\n\n`;
    textBody += `Thank you,\n${company}`;

    const htmlBody = textBody.replace(/\n/g, "<br>");

    // Send email if worker has email address
    if (worker.email) {
      try {
        await emailSender.send(
          worker.email,
          subject,
          htmlBody,
          textBody,
          {},
          true,
        );
        logger.info(
          `[AssignmentTransition] Activation email sent to ${worker.email} for assignment #${assignment.id}`,
        );
      } catch (error) {
        logger.error(
          `[AssignmentTransition] Email failed for worker ${worker.id}:`,
          error,
        );
      }
    }

    // Send SMS if worker has contact number
    if (worker.contact) {
      const smsText = `New assignment: ${bukidName} - ${pitakLocation}. Date: ${new Date(assignment.assignmentDate).toLocaleDateString()}`;
      try {
        await smsSender.send(worker.contact, smsText);
        logger.info(
          `[AssignmentTransition] Activation SMS sent to ${worker.contact} for assignment #${assignment.id}`,
        );
      } catch (error) {
        logger.error(
          `[AssignmentTransition] SMS failed for worker ${worker.contact}:`,
          error,
        );
        throw error;
      }
    }

    // Create in-app notification
    try {
      await notificationService.create(
        {
          userId: worker.id,
          title: `New Assignment`,
          message: `You have been assigned to ${bukidName} - ${pitakLocation}.`,
          type: "info",
          metadata: {
            assignmentId: assignment.id,
            bukid: bukidName,
            pitak: pitakLocation,
          },
        },
        "system",
        qr,
      );
      logger.info(
        `[AssignmentTransition] In-app notification created for worker #${worker.id}`,
      );
    } catch (error) {
      logger.error(
        `[AssignmentTransition] In-app notification failed for worker ${worker.id}:`,
        error,
      );
    }
  }
}

module.exports = { AssignmentStateTransitionService };

// src/main/ipc/workerPayment/payAll.ipc.js
const Payment = require("../../../../entities/Payment");
const PaymentHistory = require("../../../../entities/PaymentHistory");
const auditLogger = require("../../../../utils/auditLogger");
const { updateDb, saveDb } = require("../../../../utils/dbUtils/dbActions");

/**
 * Generate a unique reference number for payment.
 * Format: PAY-YYYYMMDD-HHMMSS-XXXX
 */
function generateReferenceNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${yyyy}${mm}${dd}-${hh}${min}${ss}-${random}`;
}

/**
 * Pay all pending/partially paid payments for a worker.
 * @param {Object} params - { workerId, paymentMethod?, notes? }
 * @param {import("typeorm/query-runner/QueryRunner.js").QueryRunner} queryRunner - transaction runner
 */
module.exports = async (params, queryRunner) => {
  try {
    const { workerId, paymentMethod, notes } = params;

    if (!workerId) throw new Error("workerId is required");

    const paymentRepo = queryRunner.manager.getRepository(Payment);
    const historyRepo = queryRunner.manager.getRepository(PaymentHistory);

    // Find all pending or partially paid payments for this worker
    const pendingPayments = await paymentRepo
      .createQueryBuilder("payment")
      .leftJoinAndSelect("payment.worker", "worker")
      .leftJoinAndSelect("payment.pitak", "pitak")
      .leftJoinAndSelect("payment.assignment", "assignment")
      .where("worker.id = :workerId", { workerId })
      .andWhere("payment.status IN (:...statuses)", {
        statuses: ["pending", "partially_paid"],
      })
      .andWhere("payment.netPay > 0")
      .getMany();

    if (pendingPayments.length === 0) {
      return {
        status: false,
        message: "No pending or partially paid payments found for this worker",
        data: null,
      };
    }

    const updatedPayments = [];
    for (const payment of pendingPayments) {
      const oldStatus = payment.status;

      payment.status = "completed";
      payment.paymentDate = new Date();
      if (paymentMethod) payment.paymentMethod = paymentMethod;
      payment.referenceNumber = generateReferenceNumber(); // auto-generated
      if (notes) payment.notes = notes;
      payment.updatedAt = new Date();

      const savedPayment = await updateDb(paymentRepo, payment);
      updatedPayments.push(savedPayment);

      // Create PaymentHistory entry
      const history = historyRepo.create({
        payment: savedPayment,
        actionType: "status_change",
        changedField: "status",
        oldValue: oldStatus,
        newValue: "completed",
        referenceNumber: savedPayment.referenceNumber,
        notes: notes || `Payment completed via payAll`,
        performedBy: "system",
        paymentMethod: paymentMethod || savedPayment.paymentMethod,
      });

      await saveDb(historyRepo, history);

      await auditLogger.logUpdate(
        "Payment",
        savedPayment.id,
        { status: oldStatus },
        { status: "completed", referenceNumber: savedPayment.referenceNumber },
        "system",
      );
    }

    return {
      status: true,
      message: `Successfully paid ${updatedPayments.length} payment(s)`,
      data: updatedPayments,
    };
  } catch (error) {
    console.error("Error in payAll:", error);
    throw error;
  }
};

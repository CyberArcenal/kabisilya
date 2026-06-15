// src/main/ipc/payment/record_worker_payment.ipc.js
//@ts-check

const paymentService = require("../../../../services/PaymentService");
const { logger } = require("../../../../utils/logger");

/**
 * IPC handler for bulk worker payment (one transaction covering debt deduction and multiple payments)
 * @param {Object} params - { workerId, totalAmount, debtDeduction, paymentMethod, referenceNumber, notes, user }
 * @param {import("typeorm").QueryRunner} queryRunner
 */
module.exports = async (params, queryRunner) => {
  const {
    workerId,
    totalAmount,
    debtDeduction,
    paymentMethod,
    referenceNumber,
    notes,
    user = "system",
  } = params;

  if (!workerId) {
    return {
      status: false,
      message: "workerId is required",
      data: null,
    };
  }
  if (totalAmount === undefined || totalAmount <= 0) {
    return {
      status: false,
      message: "totalAmount must be greater than zero",
      data: null,
    };
  }
  if (debtDeduction === undefined || debtDeduction < 0) {
    return {
      status: false,
      message: "debtDeduction must be a non-negative number",
      data: null,
    };
  }
  if (debtDeduction > totalAmount) {
    return {
      status: false,
      message: "debtDeduction cannot exceed totalAmount",
      data: null,
    };
  }
  if (!paymentMethod) {
    return {
      status: false,
      message: "paymentMethod is required",
      data: null,
    };
  }

  try {
    const result = await paymentService.recordWorkerPayment(
      workerId,
      totalAmount,
      debtDeduction,
      paymentMethod,
      referenceNumber,
      notes,
      user,
      queryRunner,
    );

    return {
      status: true,
      message: "Worker payment recorded successfully",
      data: result,
    };
  } catch (error) {
    logger.error("recordWorkerPayment IPC error:", error);
    return {
      status: false,
      message: error.message || "Failed to record worker payment",
      data: null,
    };
  }
};

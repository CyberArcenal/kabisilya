// src/main/ipc/payment/update_status.ipc
const paymentService = require("../../../../services/PaymentService");

module.exports = async (params, queryRunner) => {
  try {
    const { id, status, userId } = params;
    if (!id) throw new Error("Payment ID is required");
    if (!status) throw new Error("New status is required");

    const updated = await paymentService.updateStatus(id, status, userId || "system");
    return {
      status: true,
      message: "Payment status updated successfully",
      data: updated,
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
      data: null,
    };
  }
};
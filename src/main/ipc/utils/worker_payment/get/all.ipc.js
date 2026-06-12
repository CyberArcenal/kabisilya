// src/main/ipc/workerPayment/get/all.ipc.js
const debtService = require("../../../../../services/DebtService");
const paymentService = require("../../../../../services/PaymentService");
const workerService = require("../../../../../services/WorkerService");

module.exports = async (params) => {
  try {
    // Fetch all workers, payments, debts
    const workers = await workerService.findAll(params);
    const payments = await paymentService.findAll(); // could add filters if needed
    const debts = await debtService.findAll();

    // Compute stats per worker
    const workersWithStats = workers.map((worker) => {
      const workerPayments = payments.filter((p) => p.worker?.id === worker.id);
      const workerDebts = debts.filter((d) => d.worker?.id === worker.id);

      // Pending amount: sum of netPay for payments with status 'pending' or 'partially_paid'
      const pendingAmount = workerPayments
        .filter((p) => p.status === "pending" || p.status === "partially_paid")
        .reduce((sum, p) => sum + parseFloat(p.netPay), 0);

      // Total debt balance
      const totalDebt = workerDebts.reduce(
        (sum, d) => sum + parseFloat(d.balance),
        0,
      );

      // Last payment date (most recent payment with paymentDate)
      const paidPayments = workerPayments.filter((p) => p.paymentDate);
      paidPayments.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate),
      );
      const lastPaymentDate =
        paidPayments.length > 0 ? paidPayments[0].paymentDate : null;

      return {
        ...worker,
        pendingAmount,
        totalDebt,
        lastPaymentDate,
      };
    });

    // Optional filtering (e.g., by pendingAmount > 0) could be added here

    return {
      status: true,
      message: "Worker payments fetched successfully",
      data: workersWithStats,
    };
  } catch (error) {
    console.error("Error in getAllWorkerPayments:", error);
    return {
      status: false,
      message: error.message,
      data: null,
    };
  }
};

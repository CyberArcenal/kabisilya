import { useCallback } from "react";
import { dialogs } from "../../../../utils/dialogs";
import debtAPI from "../../../../api/core/debt";
import paymentAPI from "../../../../api/core/payment"; // added
import type { WorkerDebtSummary } from "../utils/aggregateDebts";
import { showError } from "../../../../utils/notification";

export const useDebtSummaryActions = (refresh: () => void) => {
  // Delete all debts of a single worker
  const handleDeleteWorkerDebts = async (workerId: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Worker Debts",
      message:
        "Are you sure you want to delete ALL debts of this worker? This action cannot be undone.",
    });
    if (!confirmed) return;
    try {
      const res = await debtAPI.getAll({ workerId, limit: 10000 });
      const debtIds = res.data.items.map((d) => d.id);
      await Promise.all(debtIds.map((id) => debtAPI.delete(id)));
      refresh();
      dialogs.success("All debts of the worker have been deleted.");
    } catch (error) {
      console.error("Failed to delete worker debts", error);
      dialogs.error("Failed to delete worker debts. Please try again.");
    }
  };

  // Bulk delete – delete all debts of selected workers
  const handleBulkDelete = async (workerIds: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete Debts",
      message: `Delete ALL debts of ${workerIds.length} worker(s)? This action cannot be undone.`,
    });
    if (!confirmed) return;
    try {
      const allDebts = await Promise.all(
        workerIds.map((workerId) => debtAPI.getAll({ workerId, limit: 10000 })),
      );
      const debtIds = allDebts.flatMap((res) =>
        res.data.items.map((d) => d.id),
      );
      await Promise.all(debtIds.map((id) => debtAPI.delete(id)));
      refresh();
      dialogs.success(`Deleted all debts of ${workerIds.length} worker(s).`);
    } catch (error) {
      console.error("Bulk delete failed", error);
      dialogs.error("Bulk delete failed. Please try again.");
    }
  };

  // Bulk status change – change status of all debts of selected workers
  const handleBulkStatusChange = async (
    workerIds: number[],
    newStatus: string,
  ) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change all debts of ${workerIds.length} worker(s) to "${newStatus}"?`,
    });
    if (!confirmed) return;
    try {
      const allDebts = await Promise.all(
        workerIds.map((workerId) => debtAPI.getAll({ workerId, limit: 10000 })),
      );
      const debtIds = allDebts.flatMap((res) =>
        res.data.items.map((d) => d.id),
      );
      await Promise.all(
        debtIds.map((id) => debtAPI.updateStatus(id, newStatus)),
      );
      refresh();
      dialogs.success(
        `Status changed to "${newStatus}" for ${workerIds.length} worker(s).`,
      );
    } catch (error) {
      console.error("Bulk status change failed", error);
      dialogs.error("Bulk status change failed. Please try again.");
    }
  };

  // Record payment for a specific debt (calls debtAPI.payDebt)
  const handleRecordPayment = async (
    debtId: number,
    amount: number,
    paymentMethod: string,
    referenceNumber?: string,
    notes?: string,
  ) => {
    try {
      await debtAPI.payDebt(
        debtId,
        amount,
        paymentMethod,
        referenceNumber,
        notes,
      );
      dialogs.success("Payment recorded successfully.");
    } catch (error: any) {
      console.error("Failed to record payment", error);
      dialogs.error(
        error.message || "Failed to record payment. Please try again.",
      );
      throw error;
    }
  };

  const handlePayAllDebts = async (data: {
    workerId: number;
    totalAmount: number;
    debtDeduction: number; // ito ang amount na ibabayad
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    try {
      // Kunin ang lahat ng active debts ng worker
      const response = await debtAPI.getAll({
        workerId: data.workerId,
        limit: 10000,
      });
      if (!response.status) throw new Error(response.message || "Failed to fetch debts");

      const activeDebts = response.data.items.filter(
        (d) => d.balance > 0 && (d.status === "pending" || d.status === "partially_paid")
      );

      if (activeDebts.length === 0) {
        dialogs.info("Worker has no active debts.");
        return;
      }

      // FIFO: bayaran ang pinakamatandang utang muna
      let remaining = data.totalAmount;
      const results = [];

      for (const debt of activeDebts) {
        if (remaining <= 0) break;
        const payAmount = Math.min(remaining, debt.balance);
        
        const result = await debtAPI.payDebt(
          debt.id,
          payAmount,
          data.paymentMethod,
          data.referenceNumber,
          data.notes || `Pay all debts - partial payment`
        );
        
        if (result.status) {
          results.push(result.data);
          remaining -= payAmount;
        } else {
          throw new Error(result.message || `Failed to pay debt #${debt.id}`);
        }
      }

      dialogs.success(`Successfully paid ${results.length} debt(s) for worker.`);
      refresh();
    } catch (error: any) {
      console.error("Failed to pay all debts", error);
      dialogs.error(error.message || "Failed to pay all debts. Please try again.");
      throw error;
    }
  };

  return {
    handleDeleteWorkerDebts,
    handleBulkDelete,
    handleBulkStatusChange,
    handleRecordPayment,
    handlePayAllDebts, // new
  };
};

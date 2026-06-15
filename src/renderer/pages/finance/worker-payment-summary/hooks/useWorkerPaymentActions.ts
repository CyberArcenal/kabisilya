// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentActions.ts
import { useCallback } from "react";
import { dialogs } from "../../../../utils/dialogs";
import paymentAPI from "../../../../api/core/payment";
import type { WorkerPaymentSummary } from "../utils/aggregatePayments";

export const useWorkerPaymentActions = (refresh: () => void) => {
  // Delete all payments of a single worker
  const handleDeleteWorkerPayments = async (workerId: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Worker Payments",
      message: "Are you sure you want to delete ALL payments of this worker? This action cannot be undone.",
    });
    if (!confirmed) return;
    try {
      const res = await paymentAPI.getAll({ workerId, limit: 10000 });
      const paymentIds = res.data.items.map(p => p.id);
      await Promise.all(paymentIds.map(id => paymentAPI.delete(id)));
      refresh();
    } catch (error) {
      console.error("Failed to delete worker payments", error);
    }
  };

  // Cancel all pending/partially paid payments of a single worker
  const handleCancelWorkerPayments = async (workerId: number) => {
    const confirmed = await dialogs.confirm({
      title: "Cancel Worker Payments",
      message: "Are you sure you want to cancel all pending/partially paid payments of this worker?",
    });
    if (!confirmed) return;
    try {
      // Get pending payments
      const pendingRes = await paymentAPI.getAll({ workerId, status: "pending", limit: 10000 });
      // Get partially paid payments
      const partiallyRes = await paymentAPI.getAll({ workerId, status: "partially_paid", limit: 10000 });
      
      const paymentIds = [
        ...pendingRes.data.items.map(p => p.id),
        ...partiallyRes.data.items.map(p => p.id)
      ];
      
      await Promise.all(paymentIds.map(id => paymentAPI.updateStatus(id, "cancelled")));
      refresh();
    } catch (error) {
      console.error("Failed to cancel worker payments", error);
    }
  };

  // Bulk delete – delete all payments of selected workers
  const handleBulkDelete = async (workerIds: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ALL payments of ${workerIds.length} worker(s)? This action cannot be undone.`,
    });
    if (!confirmed) return;
    try {
      const allPayments = await Promise.all(workerIds.map(workerId => paymentAPI.getAll({ workerId, limit: 10000 })));
      const paymentIds = allPayments.flatMap(res => res.data.items.map(p => p.id));
      await Promise.all(paymentIds.map(id => paymentAPI.delete(id)));
      refresh();
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  // Bulk status change – change status of all payments of selected workers
  const handleBulkStatusChange = async (workerIds: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change all payments of ${workerIds.length} worker(s) to "${newStatus}"?`,
    });
    if (!confirmed) return;
    try {
      const allPayments = await Promise.all(workerIds.map(workerId => paymentAPI.getAll({ workerId, limit: 10000 })));
      const paymentIds = allPayments.flatMap(res => res.data.items.map(p => p.id));
      await Promise.all(paymentIds.map(id => paymentAPI.updateStatus(id, newStatus)));
      refresh();
    } catch (error) {
      console.error("Bulk status change failed", error);
    }
  };

  // Record bulk payment for a worker (calls backend recordWorkerPayment)
  const handleRecordPaymentSubmit = async (workerId: number, data: {
    totalAmount: number;
    debtDeduction: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    await paymentAPI.recordWorkerPayment({
      workerId,
      totalAmount: data.totalAmount,
      debtDeduction: data.debtDeduction,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
    });
  };

  // View payments – just returns the worker (used by modal)
  const handleViewPayments = (worker: WorkerPaymentSummary) => {
    return worker;
  };

  return {
    handleDeleteWorkerPayments,
    handleCancelWorkerPayments,
    handleBulkDelete,
    handleBulkStatusChange,
    handleRecordPaymentSubmit,
    handleViewPayments,
  };
};
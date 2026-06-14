// src/renderer/pages/finance/worker-payments/hooks/usePaymentsActions.ts
import { useCallback } from "react";
import { dialogs } from "../../../../utils/dialogs";
import paymentAPI from "../../../../api/core/payment";
import debtAPI from "../../../../api/core/debt";
import type { PaymentWithDetails } from "../types";

export const usePaymentsActions = (
  fetchPayments: (params: any) => Promise<void>,
  setRecordPayment: (payment: PaymentWithDetails | null) => void,
  setWorkerOutstandingDebt: (debt: number) => void,
  recordModal: { open: () => void; close: () => void }
) => {
  const fetchWorkerOutstandingDebt = useCallback(async (workerId: number) => {
    try {
      const res = await debtAPI.getAll({ workerId, limit: 1000 });
      if (res.status) {
        const totalBalance = res.data.items
          .filter((d) => d.status === "pending" || d.status === "partially_paid")
          .reduce((sum, d) => sum + d.balance, 0);
        setWorkerOutstandingDebt(totalBalance);
      } else {
        setWorkerOutstandingDebt(0);
      }
    } catch (error) {
      console.error("Failed to fetch worker debt", error);
      setWorkerOutstandingDebt(0);
    }
  }, [setWorkerOutstandingDebt]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Payment",
      message: "Are you sure you want to delete this payment?",
    });
    if (confirmed) {
      try {
        await paymentAPI.delete(id);
        await fetchPayments({});
      } catch (error) {
        console.error("Failed to delete payment", error);
      }
    }
  };

  const handleRecordPayment = async (payment: PaymentWithDetails) => {
    setRecordPayment(payment);
    await fetchWorkerOutstandingDebt(payment.worker?.id || 0);
    recordModal.open();
  };

  const handleCancelPayment = async (payment: PaymentWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Cancel Payment",
      message: "Are you sure you want to cancel this payment? This action cannot be undone.",
    });
    if (!confirmed) return;
    try {
      await paymentAPI.updateStatus(payment.id, "cancelled");
      await fetchPayments({});
    } catch (error) {
      console.error("Failed to cancel payment", error);
    }
  };

  const handleConfirmRecord = async (data: {
    amountPaid: number;
    applyToDebt: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }, recordPayment: PaymentWithDetails | null) => {
    if (!recordPayment) return;
    await paymentAPI.recordPayment(recordPayment.id, data);
    await fetchPayments({});
    recordModal.close();
    setRecordPayment(null);
  };

  const handleChangeStatus = async (payment: PaymentWithDetails, newStatus: string) => {
    await paymentAPI.updateStatus(payment.id, newStatus);
    await fetchPayments({});
  };

  return {
    handleDelete,
    handleRecordPayment,
    handleCancelPayment,
    handleConfirmRecord: (data: any) => handleConfirmRecord(data, null), // will need closure
    handleChangeStatus,
  };
};
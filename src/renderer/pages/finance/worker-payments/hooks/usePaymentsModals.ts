// src/renderer/pages/finance/worker-payments/hooks/usePaymentsModals.ts
import { useState } from "react";
import { useModal } from "../../../../hooks/useModal";
import type { PaymentWithDetails, PaymentFormData } from "../types";

export const usePaymentsModals = () => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [editingPayment, setEditingPayment] = useState<(PaymentFormData & { id: number }) | null>(null);
  const [statusChangePayment, setStatusChangePayment] = useState<PaymentWithDetails | null>(null);
  const [recordPayment, setRecordPayment] = useState<PaymentWithDetails | null>(null);
  const [workerOutstandingDebt, setWorkerOutstandingDebt] = useState(0);

  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();
  const recordModal = useModal();

  return {
    selectedPayment,
    editingPayment,
    statusChangePayment,
    recordPayment,
    workerOutstandingDebt,
    setSelectedPayment,
    setEditingPayment,
    setStatusChangePayment,
    setRecordPayment,
    setWorkerOutstandingDebt,
    viewModal,
    formModal,
    statusModal,
    recordModal,
  };
};
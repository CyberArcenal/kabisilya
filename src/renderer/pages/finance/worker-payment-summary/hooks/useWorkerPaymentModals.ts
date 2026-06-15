// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentModals.ts
import { useState } from "react";
import type { WorkerPaymentSummary } from "../utils/aggregatePayments";

export const useWorkerPaymentModals = () => {
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; worker: WorkerPaymentSummary | null }>({
    isOpen: false,
    worker: null,
  });
  const [recordModal, setRecordModal] = useState<{ isOpen: boolean; worker: WorkerPaymentSummary | null }>({
    isOpen: false,
    worker: null,
  });

  const openViewModal = (worker: WorkerPaymentSummary) => {
    setViewModal({ isOpen: true, worker });
  };
  const closeViewModal = () => {
    setViewModal({ isOpen: false, worker: null });
  };

  const openRecordModal = (worker: WorkerPaymentSummary) => {
    setRecordModal({ isOpen: true, worker });
  };
  const closeRecordModal = () => {
    setRecordModal({ isOpen: false, worker: null });
  };

  return {
    selectedWorker: viewModal.worker,
    viewModal: { isOpen: viewModal.isOpen, worker: viewModal.worker, close: closeViewModal },
    recordModal: { isOpen: recordModal.isOpen, worker: recordModal.worker, close: closeRecordModal },
    openViewModal,
    closeViewModal,
    openRecordModal,
    closeRecordModal,
  };
};
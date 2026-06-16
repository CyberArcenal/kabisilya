import { useState } from "react";
import type { WorkerDebtSummary } from "../utils/aggregateDebts";
import type { Debt } from "../../../../api/core/debt";

export const useDebtSummaryModals = () => {
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    worker: WorkerDebtSummary | null;
  }>({ isOpen: false, worker: null });

  const [recordModal, setRecordModal] = useState<{
    isOpen: boolean;
    debt: Debt | null;
    workerName: string;
  }>({ isOpen: false, debt: null, workerName: "" });

  // ✅ Baguhin: magdagdag ng totalBalance sa state
  const [payAllModal, setPayAllModal] = useState<{
    isOpen: boolean;
    worker: WorkerDebtSummary | null;
    totalBalance: number; // ito ang tunay na kabuuang balanse
  }>({ isOpen: false, worker: null, totalBalance: 0 });

  const openViewModal = (worker: WorkerDebtSummary) => {
    setViewModal({ isOpen: true, worker });
  };
  const closeViewModal = () => {
    setViewModal({ isOpen: false, worker: null });
  };

  const openRecordModal = (debt: Debt, workerName: string) => {
    setRecordModal({ isOpen: true, debt, workerName });
  };
  const closeRecordModal = () => {
    setRecordModal({ isOpen: false, debt: null, workerName: "" });
  };

  // ✅ Baguhin: tumatanggap ng totalBalance
  const openPayAllModal = (worker: WorkerDebtSummary, totalBalance: number) => {
    setPayAllModal({ isOpen: true, worker, totalBalance });
  };
  const closePayAllModal = () => {
    setPayAllModal({ isOpen: false, worker: null, totalBalance: 0 });
  };

  return {
    viewModal: { isOpen: viewModal.isOpen, worker: viewModal.worker, close: closeViewModal },
    recordModal: { isOpen: recordModal.isOpen, debt: recordModal.debt, workerName: recordModal.workerName, close: closeRecordModal },
    payAllModal: { isOpen: payAllModal.isOpen, worker: payAllModal.worker, totalBalance: payAllModal.totalBalance, close: closePayAllModal },
    openViewModal,
    closeViewModal,
    openRecordModal,
    closeRecordModal,
    openPayAllModal,
    closePayAllModal,
  };
};
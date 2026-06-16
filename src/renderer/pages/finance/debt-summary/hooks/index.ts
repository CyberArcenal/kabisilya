import { useCallback, useEffect } from "react";
import { useDebtSummaryCore } from "./useDebtSummaryCore";
import { useDebtSummaryFilters } from "./useDebtSummaryFilters";
import { useDebtSummaryPagination } from "./useDebtSummaryPagination";
import { useDebtSummarySorting } from "./useDebtSummarySorting";
import { useDebtSummaryActions } from "./useDebtSummaryActions";
import { useDebtSummaryModals } from "./useDebtSummaryModals";
import { useDebtSummarySelection } from "./useDebtSummarySelection";
import type { WorkerDebtSummary } from "../utils/aggregateDebts";
import debtAPI from "../../../../api/core/debt";
import { dialogs } from "../../../../utils/dialogs";

export const useDebtSummary = () => {
  const { workers, loading, totalCount, totalPages, fetchWorkers } = useDebtSummaryCore();

  const {
    filters,
    setSearch,
    setSessionId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    resetFilters,
  } = useDebtSummaryFilters();

  const { page, limit, setPage, setLimit } = useDebtSummaryPagination();
  const { sortBy, sortOrder, setSort } = useDebtSummarySorting();

  const {
    viewModal,
    recordModal,
    payAllModal,
    openViewModal,
    openRecordModal,
    openPayAllModal,
    closeViewModal,
    closeRecordModal,
    closePayAllModal,
  } = useDebtSummaryModals();

  const [selectedWorkerIds, setSelectedWorkerIds] = useDebtSummarySelection();

  const refresh = useCallback(() => {
    fetchWorkers({
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters.search,
      sessionId: filters.sessionId,
      status: filters.status,
      dueDateStart: filters.dueDateStart,
      dueDateEnd: filters.dueDateEnd,
      minAmount: filters.minAmount,
      maxAmount: filters.maxAmount,
    });
  }, [page, limit, sortBy, sortOrder, filters, fetchWorkers]);

  const {
    handleDeleteWorkerDebts,
    handleBulkDelete,
    handleBulkStatusChange,
    handleRecordPayment,
    handlePayAllDebts,
  } = useDebtSummaryActions(refresh);

  // ✅ BAGONG onPayAllDebts – na may active debt filtering
  const onPayAllDebts = async (worker: WorkerDebtSummary) => {
    try {
      const response = await debtAPI.getAll({
        workerId: worker.workerId,
        limit: 10000,
      });
      if (!response.status) throw new Error(response.message || "Failed to fetch debts");
      const allDebts = response.data.items;

      // Filter active debts (pending/partially_paid with balance > 0)
      const activeDebts = allDebts.filter(
        (d) => d.balance > 0 && (d.status === "pending" || d.status === "partially_paid")
      );
      const totalBalance = activeDebts.reduce((sum, d) => sum + d.balance, 0);

      if (totalBalance === 0) {
        dialogs.info("Worker has no active debts to pay.");
        return;
      }

      openPayAllModal(worker, totalBalance);
    } catch (error: any) {
      console.error("Failed to fetch worker debts for pay-all", error);
      dialogs.error(error.message || "Unable to load debts. Please try again.");
    }
  };

  const onViewWorker = (worker: WorkerDebtSummary) => openViewModal(worker);
  const onRecordPayment = (debt: any, workerName: string) => openRecordModal(debt, workerName);

  const onDeleteWorker = async (workerId: number) => {
    await handleDeleteWorkerDebts(workerId);
    refresh();
  };

  const onBulkDelete = async (ids: number[]) => {
    await handleBulkDelete(ids);
    setSelectedWorkerIds([]);
    refresh();
  };

  const onBulkStatusChange = async (ids: number[], newStatus: string) => {
    await handleBulkStatusChange(ids, newStatus);
    setSelectedWorkerIds([]);
    refresh();
  };

  const onRecordSubmit = async (data: {
    debtId: number;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    await handleRecordPayment(
      data.debtId,
      data.amount,
      data.paymentMethod,
      data.referenceNumber,
      data.notes
    );
    closeRecordModal();
    refresh();
  };

  const onPayAllSubmit = async (data: {
    totalAmount: number;
    debtDeduction: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    if (!payAllModal.worker) return;
    await handlePayAllDebts({
      workerId: payAllModal.worker.workerId,
      ...data,
    });
    closePayAllModal();
    refresh();
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    workers,
    loading,
    totalCount,
    totalPages,
    filters,
    setSearch,
    setSessionId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    resetFilters,
    page,
    limit,
    setPage,
    setLimit,
    sortBy,
    sortOrder,
    setSort,
    viewModal: {
      isOpen: viewModal.isOpen,
      worker: viewModal.worker,
      close: closeViewModal,
    },
    recordModal: {
      isOpen: recordModal.isOpen,
      debt: recordModal.debt,
      workerName: recordModal.workerName,
      close: closeRecordModal,
      onSubmit: onRecordSubmit,
    },
    payAllModal: {
      isOpen: payAllModal.isOpen,
      worker: payAllModal.worker,
      totalBalance: payAllModal.totalBalance,
      close: closePayAllModal,
      onSubmit: onPayAllSubmit,
    },
    onViewWorker,
    onRecordPayment,
    onPayAllDebts,
    onDeleteWorker,
    onBulkDelete,
    onBulkStatusChange,
    selectedWorkerIds,
    setSelectedWorkerIds,
    refresh,
  };
};
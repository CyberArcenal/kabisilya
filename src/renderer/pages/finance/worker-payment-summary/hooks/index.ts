// src/renderer/pages/finance/worker-payment-summary/hooks/index.ts
import { useCallback, useEffect } from "react";
import { useWorkerPaymentCore } from "./useWorkerPaymentCore";
import { useWorkerPaymentFilters } from "./useWorkerPaymentFilters";
import { useWorkerPaymentPagination } from "./useWorkerPaymentPagination";
import { useWorkerPaymentSorting } from "./useWorkerPaymentSorting";
import { useWorkerPaymentActions } from "./useWorkerPaymentActions";
import { useWorkerPaymentModals } from "./useWorkerPaymentModals";
import { useWorkerPaymentSelection } from "./useWorkerPaymentSelection";
import type { WorkerPaymentSummary } from "../utils/aggregatePayments";

export const useWorkerPaymentSummary = () => {
  // Core data fetching
  const { workers, loading, totalCount, totalPages, fetchWorkers } =
    useWorkerPaymentCore();

  // Filters (search, session, date range, etc.)
  const {
    filters,
    setSearch,
    setSessionId,
    setStartDate,
    setEndDate,
    resetFilters,
  } = useWorkerPaymentFilters();

  // Pagination
  const { page, limit, setPage, setLimit } = useWorkerPaymentPagination();

  // Sorting
  const { sortBy, sortOrder, setSort } = useWorkerPaymentSorting();

  // Modals (view payments, record payment)
  const {
    selectedWorker,
    viewModal,
    recordModal,
    openViewModal,
    closeViewModal,
    openRecordModal,
    closeRecordModal,
  } = useWorkerPaymentModals();

  // Combine selected IDs for bulk actions (from table selection)
  const [selectedWorkerIds, setSelectedWorkerIds] = useWorkerPaymentSelection();

  // Refresh when dependencies change
  const refresh = useCallback(() => {
    fetchWorkers({
      page,
      limit,
      sortBy,
      sortOrder,
      search: filters.search,
      sessionId: filters.sessionId,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
  }, [page, limit, sortBy, sortOrder, filters, fetchWorkers]);

  const {
    handleDeleteWorkerPayments,
    handleCancelWorkerPayments,
    handleBulkDelete,
    handleBulkStatusChange,
    handleRecordPaymentSubmit,
    handleViewPayments,
  } = useWorkerPaymentActions(refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handlers for table actions
  const onViewWorker = (worker: WorkerPaymentSummary) => {
    openViewModal(worker);
  };

  const onRecordPayment = (worker: WorkerPaymentSummary) => {
    openRecordModal(worker);
  };

  const onDeleteWorker = async (workerId: number) => {
    await handleDeleteWorkerPayments(workerId);
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
    totalAmount: number;
    debtDeduction: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    if (!recordModal.worker) return;
    await handleRecordPaymentSubmit(recordModal.worker.workerId, data);
    closeRecordModal();
    refresh();
  };

  return {
    // Data
    workers,
    loading,
    totalCount,
    totalPages,
    // Filters
    filters,
    setSearch,
    setSessionId,
    setStartDate,
    setEndDate,
    resetFilters,
    // Pagination
    page,
    limit,
    setPage,
    setLimit,
    // Sorting
    sortBy,
    sortOrder,
    setSort,
    // Modals
    viewModal: {
      isOpen: viewModal.isOpen,
      worker: viewModal.worker,
      close: closeViewModal,
    },
    recordModal: {
      isOpen: recordModal.isOpen,
      worker: recordModal.worker,
      close: closeRecordModal,
      onSubmit: onRecordSubmit,
    },
    // Actions
    onViewWorker,
    onRecordPayment,
    onDeleteWorker,
    onBulkDelete,
    onBulkStatusChange,
    // Selection (for bulk)
    selectedWorkerIds,
    setSelectedWorkerIds,
    // Refresh
    refresh,
  };
};

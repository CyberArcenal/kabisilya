// src/renderer/pages/finance/worker-payments/hooks/usePayments.ts
import { useCallback, useEffect, useState } from "react";
import { usePaymentsCore } from "./usePaymentsCore";
import { usePaymentsFilters } from "./usePaymentsFilters";
import { usePaymentsPagination } from "./usePaymentsPagination";
import { usePaymentsSorting } from "./usePaymentsSorting";
import { usePaymentsModals } from "./usePaymentsModals";
import { usePaymentsActions } from "./usePaymentsActions";
import type { PaymentWithDetails } from "../types";
import paymentAPI from "../../../../api/core/payment";
import { usePaymentsStats } from "./usePaymentsStats";
import { dialogs } from "../../../../utils/dialogs";

export const usePayments = () => {
  // Core data
  const { payments, loading, totalCount, totalPages, fetchPayments } =
    usePaymentsCore();

  // Filters – destructure individual filter values
  const {
    filters,
    setSearchRaw,
    setWorkerIdRaw,
    setSessionIdRaw,
    setStatusRaw,
    setStartDateRaw,
    setEndDateRaw,
    resetFilters,
    createSetter,
    debounceRefs,
  } = usePaymentsFilters();

  const { search, workerId, sessionId, status, startDate, endDate } = filters;

  // Pagination
  const { page, limit, setPage, setLimit } = usePaymentsPagination();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Sorting
  const { sortBy, sortOrder, setSort } = usePaymentsSorting();

  // Modals
  const {
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
  } = usePaymentsModals();

  const { stats, statsLoading } = usePaymentsStats({
    search: filters.search,
    workerId: filters.workerId,
    sessionId: filters.sessionId,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  // Actions
  const {
    handleDelete,
    handleRecordPayment,
    handleCancelPayment,
    handleChangeStatus,
  } = usePaymentsActions(
    fetchPayments,
    setRecordPayment,
    setWorkerOutstandingDebt,
    recordModal,
  );

  // Stable refresh function that builds params and fetches
  const refresh = useCallback(() => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      workerId,
      sessionId,
      status,
      startDate,
      endDate,
    };
    fetchPayments(params);
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    workerId,
    sessionId,
    status,
    startDate,
    endDate,
    fetchPayments,
  ]);

  // Fetch when dependencies change
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Handlers for modals
  const handleView = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    viewModal.open();
  };

  const handleEdit = (payment: PaymentWithDetails) => {
    setEditingPayment({
      id: payment.id,
      workerId: payment.worker?.id || 0,
      pitakId: payment.pitak?.id || 0,
      sessionId: payment.session?.id || 0,
      assignmentId: payment.assignment?.id || null,
      amount: payment.grossPay,
      manualDeduction: payment.manualDeduction || 0,
      netPay: payment.netPay,
      paymentDate: payment.paymentDate ? payment.paymentDate.split("T")[0] : "",
      notes: payment.notes || "",
      status: payment.status,
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingPayment(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingPayment(null);
    refresh();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangePayment) return;
    await handleChangeStatus(statusChangePayment, newStatus);
    setStatusChangePayment(null);
    refresh();
  };

  const handleConfirmRecord = async (data: any) => {
    if (!recordPayment) return;
    await paymentAPI.recordPayment(recordPayment.id, data);
    refresh();
    recordModal.close();
    setRecordPayment(null);
  };

  const bulkDelete = useCallback(
    async (ids: number[]) => {
      const confirmed = await dialogs.confirm({
        title: "Bulk Delete",
        message: `Are you sure you want to delete ${ids.length} payment(s)? This action cannot be undone.`,
        confirmText: "Delete",
        icon: "danger",
      });
      if (!confirmed) return;
      try {
        await Promise.all(ids.map((id) => paymentAPI.delete(id)));
        await refresh();
        setSelectedIds([]);
      } catch (error) {
        console.error("Bulk delete failed", error);
      }
    },
    [refresh],
  );

  const bulkStatusChange = useCallback(
    async (ids: number[], newStatus: string) => {
      const confirmed = await dialogs.confirm({
        title: "Bulk Status Change",
        message: `Change ${ids.length} payment(s) to "${newStatus}"?`,
        confirmText: "Change",
      });
      if (!confirmed) return;
      try {
        await Promise.all(
          ids.map((id) => paymentAPI.updateStatus(id, newStatus)),
        );
        await refresh();
        setSelectedIds([]);
      } catch (error) {
        console.error("Bulk status change failed", error);
      }
    },
    [refresh],
  );

  const exportSelected = useCallback(() => {
    const selectedPayments = payments.filter((p) => selectedIds.includes(p.id));
    if (selectedPayments.length === 0) return;
    const headers = [
      "ID",
      "Worker",
      "Pitak",
      "Gross Pay",
      "Net Pay",
      "Amount Paid",
      "Last Payment Date",
      "Status",
      "Payment Date",
      "Reference Number",
    ];
    const rows = selectedPayments.map((p) => [
      p.id,
      p.worker?.name || "",
      p.pitak?.location || "",
      p.grossPay,
      p.netPay,
      p.amountPaid || 0,
      p.lastPaymentDate ? new Date(p.lastPaymentDate).toLocaleDateString() : "",
      p.status,
      p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "",
      p.referenceNumber || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [payments, selectedIds]);

  return {
    // Data
    payments,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    limit,
    sortBy,
    sortOrder,
    totalGross: stats.totalGross,
    totalNet: stats.totalNet,
    totalDebtDeduction: stats.totalDebtDeduction,
    statsLoading,
    // Setters
    setPage,
    setLimit,
    setSort,
    setSearch: createSetter(setSearchRaw, debounceRefs.search, () => {}),
    setWorkerId: createSetter(setWorkerIdRaw, debounceRefs.workerId, () => {}),
    setSessionId: createSetter(
      setSessionIdRaw,
      debounceRefs.sessionId,
      () => {},
    ),
    setStatus: createSetter(setStatusRaw, debounceRefs.status, () => {}),
    setStartDate: createSetter(
      setStartDateRaw,
      debounceRefs.startDate,
      () => {},
    ),
    setEndDate: createSetter(setEndDateRaw, debounceRefs.endDate, () => {}),
    resetFilters,
    // Modals
    selectedPayment,
    editingPayment,
    statusChangePayment,
    recordPayment,
    workerOutstandingDebt,
    viewModal,
    formModal,
    statusModal,
    recordModal,
    // Actions
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus: (payment: PaymentWithDetails) => {
      setStatusChangePayment(payment);
      statusModal.open();
    },
    handleConfirmStatusChange,
    handleRecordPayment,
    handleCancelPayment,
    handleConfirmRecord,
    refetch: refresh,

    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    exportSelected,
  };
};

// src/renderer/pages/finance/debts/hooks/useDebts.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { DebtWithDetails, DebtFormData } from "../types";
import debtAPI from "../../../../api/core/debt";

const DEBOUNCE_MS = 300;

export const useDebts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [debts, setDebts] = useState<DebtWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination & Sorting
  const [limit, setLimitState] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 10;
  });
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sortBy") || "dueDate",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    () => (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC",
  );

  // Filters
  const [search, setSearchState] = useState(
    () => searchParams.get("search") || "",
  );
  const [workerId, setWorkerIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("worker");
    return id ? parseInt(id, 10) : undefined;
  });
  const [status, setStatusState] = useState(
    () => searchParams.get("status") || "",
  );
  const [dueDateStart, setDueDateStartState] = useState(
    () => searchParams.get("dueDateStart") || "",
  );
  const [dueDateEnd, setDueDateEndState] = useState(
    () => searchParams.get("dueDateEnd") || "",
  );
  const [minAmount, setMinAmountState] = useState<number | undefined>(() => {
    const val = searchParams.get("minAmount");
    return val ? parseFloat(val) : undefined;
  });
  const [maxAmount, setMaxAmountState] = useState<number | undefined>(() => {
    const val = searchParams.get("maxAmount");
    return val ? parseFloat(val) : undefined;
  });

  // Modal states
  const [selectedDebt, setSelectedDebt] = useState<DebtWithDetails | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [paymentDebt, setPaymentDebt] = useState<DebtWithDetails | null>(null);
  const [stats, setStats] = useState({
    totalDebts: 0,
    totalBalance: 0,
    overdueCount: 0,
    averageInterest: 0,
  });

  const viewModal = useModal();
  const formModal = useModal();
  const paymentModal = useModal();

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    workerId: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    dueDateStart: useRef<NodeJS.Timeout>(),
    dueDateEnd: useRef<NodeJS.Timeout>(),
    minAmount: useRef<NodeJS.Timeout>(),
    maxAmount: useRef<NodeJS.Timeout>(),
  };

  // URL update helper
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newWorkerId: number | undefined,
      newStatus: string,
      newDueDateStart: string,
      newDueDateEnd: string,
      newMinAmount: number | undefined,
      newMaxAmount: number | undefined,
      newLimit: number,
      newSortBy: string,
      newSortOrder: "ASC" | "DESC",
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newWorkerId) params.worker = newWorkerId.toString();
      if (newStatus) params.status = newStatus;
      if (newDueDateStart) params.dueDateStart = newDueDateStart;
      if (newDueDateEnd) params.dueDateEnd = newDueDateEnd;
      if (newMinAmount !== undefined)
        params.minAmount = newMinAmount.toString();
      if (newMaxAmount !== undefined)
        params.maxAmount = newMaxAmount.toString();
      if (newPage > 1) params.page = newPage.toString();
      if (newLimit !== 10) params.limit = newLimit.toString();
      if (newSortBy !== "dueDate") params.sortBy = newSortBy;
      if (newSortOrder !== "ASC") params.sortOrder = newSortOrder;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Sync URL changes to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlWorker = searchParams.get("worker");
    const urlStatus = searchParams.get("status") || "";
    const urlDueDateStart = searchParams.get("dueDateStart") || "";
    const urlDueDateEnd = searchParams.get("dueDateEnd") || "";
    const urlMinAmount = searchParams.get("minAmount");
    const urlMaxAmount = searchParams.get("maxAmount");
    const urlLimit = searchParams.get("limit");
    const urlSortBy = searchParams.get("sortBy") || "dueDate";
    const urlSortOrder =
      (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC";

    let needsUpdate = false;
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) {
      setPageState(newPage);
      needsUpdate = true;
    }
    if (urlSearch !== search) {
      setSearchState(urlSearch);
      needsUpdate = true;
    }
    const newWorkerId = urlWorker ? parseInt(urlWorker, 10) : undefined;
    if (newWorkerId !== workerId) {
      setWorkerIdState(newWorkerId);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
    if (urlDueDateStart !== dueDateStart) {
      setDueDateStartState(urlDueDateStart);
      needsUpdate = true;
    }
    if (urlDueDateEnd !== dueDateEnd) {
      setDueDateEndState(urlDueDateEnd);
      needsUpdate = true;
    }
    const newMinAmount = urlMinAmount ? parseFloat(urlMinAmount) : undefined;
    if (newMinAmount !== minAmount) {
      setMinAmountState(newMinAmount);
      needsUpdate = true;
    }
    const newMaxAmount = urlMaxAmount ? parseFloat(urlMaxAmount) : undefined;
    if (newMaxAmount !== maxAmount) {
      setMaxAmountState(newMaxAmount);
      needsUpdate = true;
    }
    const newLimit = urlLimit ? parseInt(urlLimit, 10) : 10;
    if (newLimit !== limit) {
      setLimitState(newLimit);
      needsUpdate = true;
    }
    if (urlSortBy !== sortBy) {
      setSortBy(urlSortBy);
      needsUpdate = true;
    }
    if (urlSortOrder !== sortOrder) {
      setSortOrder(urlSortOrder);
      needsUpdate = true;
    }
  }, [searchParams]);

  // Setters
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(
      newPage,
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
      limit,
      sortBy,
      sortOrder,
    );
  };
  const setLimit = (newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
    updateUrl(
      1,
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
      newLimit,
      sortBy,
      sortOrder,
    );
  };
  const setSort = (field: string) => {
    let newSortBy = field;
    let newSortOrder: "ASC" | "DESC" = "ASC";
    if (sortBy === field) {
      newSortOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    }
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPageState(1);
    updateUrl(
      1,
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
      limit,
      newSortBy,
      newSortOrder,
    );
  };
  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(
        1,
        val,
        workerId,
        status,
        dueDateStart,
        dueDateEnd,
        minAmount,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setWorkerId = (val: number | undefined) => {
    setWorkerIdState(val);
    if (debounceRefs.workerId.current)
      clearTimeout(debounceRefs.workerId.current);
    debounceRefs.workerId.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        val,
        status,
        dueDateStart,
        dueDateEnd,
        minAmount,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        workerId,
        val,
        dueDateStart,
        dueDateEnd,
        minAmount,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setDueDateStart = (val: string) => {
    setDueDateStartState(val);
    if (debounceRefs.dueDateStart.current)
      clearTimeout(debounceRefs.dueDateStart.current);
    debounceRefs.dueDateStart.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        workerId,
        status,
        val,
        dueDateEnd,
        minAmount,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setDueDateEnd = (val: string) => {
    setDueDateEndState(val);
    if (debounceRefs.dueDateEnd.current)
      clearTimeout(debounceRefs.dueDateEnd.current);
    debounceRefs.dueDateEnd.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        workerId,
        status,
        dueDateStart,
        val,
        minAmount,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setMinAmount = (val: number | undefined) => {
    setMinAmountState(val);
    if (debounceRefs.minAmount.current)
      clearTimeout(debounceRefs.minAmount.current);
    debounceRefs.minAmount.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        workerId,
        status,
        dueDateStart,
        dueDateEnd,
        val,
        maxAmount,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setMaxAmount = (val: number | undefined) => {
    setMaxAmountState(val);
    if (debounceRefs.maxAmount.current)
      clearTimeout(debounceRefs.maxAmount.current);
    debounceRefs.maxAmount.current = setTimeout(() => {
      updateUrl(
        1,
        search,
        workerId,
        status,
        dueDateStart,
        dueDateEnd,
        minAmount,
        val,
        limit,
        sortBy,
        sortOrder,
      );
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const resetFilters = () => {
    setSearchState("");
    setWorkerIdState(undefined);
    setStatusState("");
    setDueDateStartState("");
    setDueDateEndState("");
    setMinAmountState(undefined);
    setMaxAmountState(undefined);
    setPageState(1);
    updateUrl(
      1,
      "",
      undefined,
      "",
      "",
      "",
      undefined,
      undefined,
      limit,
      sortBy,
      sortOrder,
    );
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      Object.values(debounceRefs).forEach(
        (ref) => ref.current && clearTimeout(ref.current),
      );
    };
  }, []);

  // Fetch debts
  const fetchDebts = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (workerId) params.workerId = workerId;
      if (status) params.status = status;
      if (dueDateStart) params.dueDateStart = dueDateStart;
      if (dueDateEnd) params.dueDateEnd = dueDateEnd;
      if (minAmount !== undefined) params.minAmount = minAmount;
      if (maxAmount !== undefined) params.maxAmount = maxAmount;

      const res = await debtAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch debts");
      setDebts(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch debts", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    workerId,
    status,
    dueDateStart,
    dueDateEnd,
    minAmount,
    maxAmount,
  ]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // Stats
  const fetchStats = useCallback(async () => {
    try {
      const params: any = {
        workerId,
        status,
        dueDateStart,
        dueDateEnd,
        minAmount,
        maxAmount,
        search,
      };
      const res = await debtAPI.getStats(params);
      if (res.status && res.data) {
        setStats({
          totalDebts: res.data.totalDebts,
          totalBalance: res.data.totalBalance,
          overdueCount: res.data.overdueCount,
          averageInterest: res.data.averageInterest || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch debt stats", error);
    }
  }, [
    workerId,
    status,
    dueDateStart,
    dueDateEnd,
    minAmount,
    maxAmount,
    search,
  ]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handlers
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Debt",
      message: "Are you sure you want to delete this debt record?",
    });
    if (confirmed) {
      try {
        await debtAPI.delete(id);
        await fetchDebts();
      } catch (error) {
        console.error("Failed to delete debt", error);
      }
    }
  };

  const handleCancelDebt = async (debt: DebtWithDetails) => {
  const confirmed = await dialogs.confirm({
    title: "Cancel Debt",
    message: `Are you sure you want to cancel this debt? This action cannot be undone.`,
    confirmText: "Cancel Debt",
    icon: "danger",
  });
  if (!confirmed) return;
  try {
    await debtAPI.updateStatus(debt.id, "cancelled");
    await fetchDebts();
  } catch (error) {
    console.error("Failed to cancel debt", error);
    dialogs.error("Failed to cancel debt");
  }
};

  const handleView = (debt: DebtWithDetails) => {
    setSelectedDebt(debt);
    viewModal.open();
  };

  const handleAddNew = () => {
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    fetchDebts();
  };

  const handleRecordPayment = (debt: DebtWithDetails) => {
    setPaymentDebt(debt);
    paymentModal.open();
  };

  const handleConfirmPayment = async (
    debtId: number,
    amount: number,
    paymentMethod: string,
    referenceNumber?: string,
    notes?: string,
  ) => {
    await debtAPI.payDebt(
      debtId,
      amount,
      paymentMethod,
      referenceNumber,
      notes,
    );
    await fetchDebts();
    setPaymentDebt(null);
  };

  // Bulk actions
  const bulkDelete = async (ids: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${ids.length} debt(s)? This action cannot be undone.`,
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map((id) => debtAPI.delete(id)));
      await fetchDebts();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const bulkStatusChange = async (ids: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change ${ids.length} debt(s) to "${newStatus}"?`,
      confirmText: "Change",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map((id) => debtAPI.updateStatus(id, newStatus)));
      await fetchDebts();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status change failed", error);
    }
  };

  const bulkExport = () => {
    const selectedDebts = debts.filter((d) => selectedIds.includes(d.id));
    if (selectedDebts.length === 0) return;
    const headers = [
      "ID",
      "Worker",
      "Amount",
      "Balance",
      "Due Date",
      "Status",
      "Interest Rate",
      "Reason",
    ];
    const rows = selectedDebts.map((d) => [
      d.id,
      d.worker?.name || "",
      d.amount,
      d.balance,
      d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "",
      d.status,
      d.interestRate,
      d.reason || "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_debts_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    const params: any = {
      limit: 10000,
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
    };
    const res = await debtAPI.getAll(params);
    if (res.status) {
      const items = res.data.items;
      const headers = [
        "ID",
        "Worker",
        "Amount",
        "Balance",
        "Due Date",
        "Status",
        "Interest Rate",
        "Reason",
      ];
      const rows = items.map((d) => [
        d.id,
        d.worker?.name || "",
        d.amount,
        d.balance,
        d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "",
        d.status,
        d.interestRate,
        d.reason || "",
      ]);
      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `debts_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      dialogs.error("Failed to export debts");
    }
  };

  return {
    debts,
    loading,
    page,
    totalPages,
    totalCount,
    statsTotal: stats.totalDebts,
    filters: {
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
    },
    totalBalance: stats.totalBalance,
    overdueCount: stats.overdueCount,
    averageInterest: stats.averageInterest,
    limit,
    sortBy,
    sortOrder,
    selectedDebt,
    viewModal,
    formModal,
    paymentDebt,
    paymentModal,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setWorkerId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    handleDelete,
    handleView,
    handleAddNew,
    handleFormSuccess,
    handleRecordPayment,
    handleConfirmPayment,
    handleCancelDebt,
    resetFilters,
    refetch: fetchDebts,
    exportToCSV,
  };
};

// src/renderer/pages/finance/debts/hooks/useDebts.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { DebtWithDetails, DebtFormData } from "../types";
import debtAPI from "../../../../api/core/debt";

const PAGE_SIZE = 10;
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

  // Selected debt for modals
  const [selectedDebt, setSelectedDebt] = useState<DebtWithDetails | null>(
    null,
  );
  const [editingDebt, setEditingDebt] = useState<
    (DebtFormData & { id: number }) | null
  >(null);
  const [statusChangeDebt, setStatusChangeDebt] =
    useState<DebtWithDetails | null>(null);
  const [paymentDebt, setPaymentDebt] = useState<DebtWithDetails | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();
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
  }, [searchParams]);

  // Setters with URL update
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
    updateUrl(1, "", undefined, "", "", "", undefined, undefined);
  };

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

  const fetchDebts = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "dueDate",
        sortOrder: "ASC",
      };
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

  // CRUD handlers
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

  const handleView = (debt: DebtWithDetails) => {
    setSelectedDebt(debt);
    viewModal.open();
  };
const handleEdit = (debt: DebtWithDetails) => {
  console.log("handleEdit called with debt:", debt);
  if (!debt) return;
  setEditingDebt({
    id: debt.id,
    workerId: debt.worker?.id || 0,
    sessionId: debt.session?.id || 0,
    amount: debt.amount,
    dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "",
    interestRate: debt.interestRate || 0,
    reason: debt.reason || "",
    status: debt.status,
  });
  formModal.open();
};

  const handleAddNew = () => {
    setEditingDebt(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingDebt(null);
    fetchDebts();
  };

  const handleChangeStatus = (debt: DebtWithDetails) => {
    setStatusChangeDebt(debt);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeDebt) return;
    await debtAPI.updateStatus(statusChangeDebt.id, newStatus);
    await fetchDebts();
    setStatusChangeDebt(null);
  };

  const handleRecordPayment = (debt: DebtWithDetails) => {
    setPaymentDebt(debt);
    paymentModal.open();
  };

  const handleConfirmPayment = async (
    debtId: number,
    amount: number,
    notes?: string,
  ) => {
    await debtAPI.payDebt(debtId, amount, notes);
    await fetchDebts();
    setPaymentDebt(null);
  };

  return {
    debts,
    loading,
    page,
    totalPages,
    totalCount,
    filters: {
      search,
      workerId,
      status,
      dueDateStart,
      dueDateEnd,
      minAmount,
      maxAmount,
    },
    setPage,
    setSearch,
    setWorkerId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    selectedDebt,
    editingDebt,
    viewModal,
    formModal,
    statusChangeDebt,
    statusModal,
    paymentDebt,
    paymentModal,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    handleRecordPayment,
    handleConfirmPayment,
    resetFilters,
  };
};

// src/renderer/pages/finance/worker-payments/hooks/usePayments.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { PaymentWithDetails, PaymentFormData } from "../types";
import paymentAPI from "../../../../api/core/payment";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const usePayments = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters (initialized from URL)
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [workerId, setWorkerIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("worker");
    return id ? parseInt(id, 10) : undefined;
  });
  const [sessionId, setSessionIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");
  const [startDate, setStartDateState] = useState(() => searchParams.get("startDate") || "");
  const [endDate, setEndDateState] = useState(() => searchParams.get("endDate") || "");

  // Selected for modals
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [editingPayment, setEditingPayment] = useState<(PaymentFormData & { id: number }) | null>(null);
  const [statusChangePayment, setStatusChangePayment] = useState<PaymentWithDetails | null>(null);

  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs for abort and debounce
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    workerId: useRef<NodeJS.Timeout>(),
    sessionId: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    startDate: useRef<NodeJS.Timeout>(),
    endDate: useRef<NodeJS.Timeout>(),
  };

  // Update URL helper
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newWorkerId: number | undefined,
      newSessionId: number | undefined,
      newStatus: string,
      newStartDate: string,
      newEndDate: string
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newWorkerId) params.worker = newWorkerId.toString();
      if (newSessionId) params.session = newSessionId.toString();
      if (newStatus) params.status = newStatus;
      if (newStartDate) params.startDate = newStartDate;
      if (newEndDate) params.endDate = newEndDate;
      if (newPage > 1) params.page = newPage.toString();
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Sync URL changes (browser back/forward) to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlWorker = searchParams.get("worker");
    const urlSession = searchParams.get("session");
    const urlStatus = searchParams.get("status") || "";
    const urlStartDate = searchParams.get("startDate") || "";
    const urlEndDate = searchParams.get("endDate") || "";

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
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) {
      setSessionIdState(newSessionId);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
    if (urlStartDate !== startDate) {
      setStartDateState(urlStartDate);
      needsUpdate = true;
    }
    if (urlEndDate !== endDate) {
      setEndDateState(urlEndDate);
      needsUpdate = true;
    }
  }, [searchParams]);

  // Setters with URL update (debounced)
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, workerId, sessionId, status, startDate, endDate);
  };

  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(1, val, workerId, sessionId, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setWorkerId = (val: number | undefined) => {
    setWorkerIdState(val);
    if (debounceRefs.workerId.current) clearTimeout(debounceRefs.workerId.current);
    debounceRefs.workerId.current = setTimeout(() => {
      updateUrl(1, search, val, sessionId, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setSessionId = (val: number | undefined) => {
    setSessionIdState(val);
    if (debounceRefs.sessionId.current) clearTimeout(debounceRefs.sessionId.current);
    debounceRefs.sessionId.current = setTimeout(() => {
      updateUrl(1, search, workerId, val, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(1, search, workerId, sessionId, val, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStartDate = (val: string) => {
    setStartDateState(val);
    if (debounceRefs.startDate.current) clearTimeout(debounceRefs.startDate.current);
    debounceRefs.startDate.current = setTimeout(() => {
      updateUrl(1, search, workerId, sessionId, status, val, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setEndDate = (val: string) => {
    setEndDateState(val);
    if (debounceRefs.endDate.current) clearTimeout(debounceRefs.endDate.current);
    debounceRefs.endDate.current = setTimeout(() => {
      updateUrl(1, search, workerId, sessionId, status, startDate, val);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setSearchState("");
    setWorkerIdState(undefined);
    setSessionIdState(undefined);
    setStatusState("");
    setStartDateState("");
    setEndDateState("");
    setPageState(1);
    updateUrl(1, "", undefined, undefined, "", "", "");
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      Object.values(debounceRefs).forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "paymentDate",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (workerId) params.workerId = workerId;
      if (sessionId) params.sessionId = sessionId;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await paymentAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch payments");

      setPayments(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch payments", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, workerId, sessionId, status, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // CRUD Handlers
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Payment",
      message: "Are you sure you want to delete this payment?",
    });
    if (confirmed) {
      try {
        await paymentAPI.delete(id);
        await fetchPayments();
      } catch (error) {
        console.error("Failed to delete payment", error);
      }
    }
  };

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
    fetchPayments();
  };

  const handleChangeStatus = (payment: PaymentWithDetails) => {
    setStatusChangePayment(payment);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangePayment) return;
    await paymentAPI.updateStatus(statusChangePayment.id, newStatus);
    await fetchPayments();
    setStatusChangePayment(null);
  };

  return {
    payments,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, workerId, sessionId, status, startDate, endDate },
    setPage,
    setSearch,
    setWorkerId,
    setSessionId,
    setStatus,
    setStartDate,
    setEndDate,
    selectedPayment,
    editingPayment,
    viewModal,
    formModal,
    statusChangePayment,
    statusModal,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
  };
};
// src/renderer/pages/finance/worker-payments/hooks/usePayments.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { PaymentWithDetails, PaymentFormData } from "../types";
import paymentAPI from "../../../../api/core/payment";

const PAGE_SIZE = 10;

export const usePayments = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<number | undefined>(undefined);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected payment for modals
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [editingPayment, setEditingPayment] = useState<(PaymentFormData & { id: number }) | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();

  // Abort controller and mounted ref
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchPayments = useCallback(async () => {
    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,        // ✅ use limit instead of pageSize
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
  }, [page, search, workerId, sessionId, status, startDate, endDate]); // PAGE_SIZE is constant

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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

  const resetFilters = () => {
    setSearch("");
    setWorkerId(undefined);
    setSessionId(undefined);
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
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
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
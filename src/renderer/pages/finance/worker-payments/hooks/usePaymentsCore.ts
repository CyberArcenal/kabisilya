// src/renderer/pages/finance/worker-payments/hooks/usePaymentsCore.ts
import { useState, useCallback, useRef } from "react";
import type { PaymentWithDetails } from "../types";
import paymentAPI from "../../../../api/core/payment";

export const usePaymentsCore = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPayments = useCallback(async (params: any) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
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
  }, []);


  return {
    payments,
    loading,
    totalCount,
    totalPages,
    fetchPayments,
    isMountedRef,
    abortControllerRef,
  };
};
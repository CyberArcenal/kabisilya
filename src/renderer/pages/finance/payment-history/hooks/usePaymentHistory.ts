// src/renderer/pages/finance/payment-history/hooks/usePaymentHistory.ts
import { useState, useEffect, useCallback } from "react";
import type { PaymentHistoryWithDetails, PaymentHistoryFilters } from "../types";
import paymentHistoryAPI from "../../../../api/core/payment_history";

export const usePaymentHistory = () => {
  const [history, setHistory] = useState<PaymentHistoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [paymentId, setPaymentId] = useState<number | undefined>(undefined);
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        sortBy: "changeDate",
        sortOrder: "DESC",
      };
      if (paymentId) params.paymentId = paymentId;
      if (actionType) params.actionType = actionType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await paymentHistoryAPI.getAll(params);
      if (!res.status) throw new Error(res.message || "Failed to fetch payment history");

      setHistory(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch payment history", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, paymentId, actionType, startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const resetFilters = () => {
    setPaymentId(undefined);
    setActionType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return {
    history,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { paymentId, actionType, startDate, endDate },
    setPage,
    setPaymentId,
    setActionType,
    setStartDate,
    setEndDate,
    resetFilters,
  };
};
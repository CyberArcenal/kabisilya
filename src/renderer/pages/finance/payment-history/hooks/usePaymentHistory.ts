// src/renderer/pages/finance/payment-history/hooks/usePaymentHistory.ts
import { useState, useEffect, useCallback } from "react";
import type {
  PaymentHistoryWithDetails,
  PaymentHistoryFilters,
} from "../types";
import paymentHistoryAPI from "../../../../api/core/payment_history";

export const usePaymentHistory = () => {
  const [history, setHistory] = useState<PaymentHistoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
        limit: limit,
        sortBy: "changeDate",
        sortOrder: "DESC",
      };
      if (paymentId) params.paymentId = paymentId;
      if (actionType) params.actionType = actionType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await paymentHistoryAPI.getAll(params);
      if (!res.status)
        throw new Error(res.message || "Failed to fetch payment history");

      setHistory(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch payment history", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, paymentId, actionType, startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset page when filters change (optional but recommended)
  useEffect(() => {
    setPage(1);
  }, [paymentId, actionType, startDate, endDate]);

  const resetFilters = () => {
    setPaymentId(undefined);
    setActionType("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const refresh = () => fetchHistory();

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = [
      "Payment ID",
      "Action",
      "Field",
      "Old Value",
      "New Value",
      "Date",
      "By",
      "Notes",
    ];
    const rows = history.map((item) => [
      item.payment?.id || "",
      item.actionType || "",
      item.changedField || "",
      item.oldValue || (item.oldAmount ?? ""),
      item.newValue || (item.newAmount ?? ""),
      new Date(item.changeDate).toLocaleString(),
      item.performedBy || "system",
      item.notes || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment_history_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    history,
    loading,
    page,
    limit,
    totalCount,
    totalPages,
    filters: { paymentId, actionType, startDate, endDate },
    setPage,
    setLimit,
    setPaymentId,
    setActionType,
    setStartDate,
    setEndDate,
    resetFilters,
    refresh,
    exportToCSV,
  };
};

// src/renderer/pages/finance/debt-history/hooks/useDebtHistory.ts
import { useState, useEffect, useCallback } from "react";
import debtHistoryAPI from "../../../../api/core/debt_history";
import type { DebtHistoryWithDetails, DebtHistoryFilters } from "../types";

export const useDebtHistory = () => {
  const [history, setHistory] = useState<DebtHistoryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [debtId, setDebtId] = useState<number | undefined>(undefined);
  const [transactionType, setTransactionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
        sortBy: "transactionDate",
        sortOrder: "DESC",
      };
      if (debtId) params.debtId = debtId;
      if (transactionType) params.transactionType = transactionType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount !== undefined) params.minAmount = minAmount;
      if (maxAmount !== undefined) params.maxAmount = maxAmount;

      const res = await debtHistoryAPI.getAll(params);
      if (!res.status) throw new Error(res.message || "Failed to fetch debt history");

      setHistory(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch debt history", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debtId, transactionType, startDate, endDate, minAmount, maxAmount]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reset page when filters change (optional but recommended)
  useEffect(() => {
    setPage(1);
  }, [debtId, transactionType, startDate, endDate, minAmount, maxAmount]);

  const resetFilters = () => {
    setDebtId(undefined);
    setTransactionType("");
    setStartDate("");
    setEndDate("");
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setPage(1);
  };

  const refresh = () => fetchHistory();

  const exportToCSV = () => {
    if (history.length === 0) return;
    const headers = [
      "Debt ID",
      "Transaction Type",
      "Amount Paid",
      "Previous Balance",
      "New Balance",
      "Transaction Date",
      "Payment Method",
      "Reference Number",
      "Notes",
    ];
    const rows = history.map((item) => [
      item.debt?.id || "",
      item.transactionType || "",
      item.amountPaid.toFixed(2),
      item.previousBalance.toFixed(2),
      item.newBalance.toFixed(2),
      new Date(item.transactionDate).toLocaleString(),
      item.paymentMethod || "",
      item.referenceNumber || "",
      item.notes || "",
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debt_history_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    history,
    loading,
    page,
    pageSize,
    totalCount,
    totalPages,
    filters: { debtId, transactionType, startDate, endDate, minAmount, maxAmount },
    setPage,
    setPageSize,
    setDebtId,
    setTransactionType,
    setStartDate,
    setEndDate,
    setMinAmount,
    setMaxAmount,
    resetFilters,
    refresh,
    exportToCSV,
  };
};
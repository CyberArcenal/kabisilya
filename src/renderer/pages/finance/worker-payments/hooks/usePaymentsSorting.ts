// src/renderer/pages/finance/worker-payments/hooks/usePaymentsSorting.ts
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const usePaymentsSorting = () => {
  const [searchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "paymentDate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(() =>
    (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC"
  );

  useEffect(() => {
    const urlSortBy = searchParams.get("sortBy") || "paymentDate";
    const urlSortOrder = (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC";
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
  }, [searchParams]);

  const setSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  return { sortBy, sortOrder, setSort };
};
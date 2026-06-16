import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useDebtSummarySorting = () => {
  const [searchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "workerName");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(() =>
    (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC"
  );

  useEffect(() => {
    const urlSortBy = searchParams.get("sortBy") || "workerName";
    if (urlSortBy !== sortBy) setSortBy(urlSortBy);
    const urlSortOrder = (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC";
    if (urlSortOrder !== sortOrder) setSortOrder(urlSortOrder);
  }, [searchParams]);

  const setSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  return { sortBy, sortOrder, setSort };
};
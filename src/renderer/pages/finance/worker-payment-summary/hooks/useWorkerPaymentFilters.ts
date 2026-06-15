// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentFilters.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const useWorkerPaymentFilters = () => {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sessionId, setSessionId] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });
  const [startDate, setStartDate] = useState(() => searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(() => searchParams.get("endDate") || "");

  // Sync from URL changes (back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
    const urlSession = searchParams.get("session");
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) setSessionId(newSessionId);
    const urlStart = searchParams.get("startDate") || "";
    if (urlStart !== startDate) setStartDate(urlStart);
    const urlEnd = searchParams.get("endDate") || "";
    if (urlEnd !== endDate) setEndDate(urlEnd);
  }, [searchParams]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSessionId(undefined);
    setStartDate("");
    setEndDate("");
  }, []);

  // Memoize filters object to avoid recreation on every render
  const filters = useMemo(
    () => ({ search, sessionId, startDate, endDate }),
    [search, sessionId, startDate, endDate]
  );

  return {
    filters,
    setSearch,
    setSessionId,
    setStartDate,
    setEndDate,
    resetFilters,
  };
};
import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export const useDebtSummaryFilters = () => {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sessionId, setSessionId] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [dueDateStart, setDueDateStart] = useState(() => searchParams.get("dueDateStart") || "");
  const [dueDateEnd, setDueDateEnd] = useState(() => searchParams.get("dueDateEnd") || "");
  const [minAmount, setMinAmount] = useState<number | undefined>(() => {
    const val = searchParams.get("minAmount");
    return val ? parseFloat(val) : undefined;
  });
  const [maxAmount, setMaxAmount] = useState<number | undefined>(() => {
    const val = searchParams.get("maxAmount");
    return val ? parseFloat(val) : undefined;
  });

  // Sync from URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== search) setSearch(urlSearch);
    const urlSession = searchParams.get("session");
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) setSessionId(newSessionId);
    const urlStatus = searchParams.get("status") || "";
    if (urlStatus !== status) setStatus(urlStatus);
    const urlDueDateStart = searchParams.get("dueDateStart") || "";
    if (urlDueDateStart !== dueDateStart) setDueDateStart(urlDueDateStart);
    const urlDueDateEnd = searchParams.get("dueDateEnd") || "";
    if (urlDueDateEnd !== dueDateEnd) setDueDateEnd(urlDueDateEnd);
    const urlMinAmount = searchParams.get("minAmount");
    const newMinAmount = urlMinAmount ? parseFloat(urlMinAmount) : undefined;
    if (newMinAmount !== minAmount) setMinAmount(newMinAmount);
    const urlMaxAmount = searchParams.get("maxAmount");
    const newMaxAmount = urlMaxAmount ? parseFloat(urlMaxAmount) : undefined;
    if (newMaxAmount !== maxAmount) setMaxAmount(newMaxAmount);
  }, [searchParams]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setSessionId(undefined);
    setStatus("");
    setDueDateStart("");
    setDueDateEnd("");
    setMinAmount(undefined);
    setMaxAmount(undefined);
  }, []);

  const filters = useMemo(
    () => ({ search, sessionId, status, dueDateStart, dueDateEnd, minAmount, maxAmount }),
    [search, sessionId, status, dueDateStart, dueDateEnd, minAmount, maxAmount]
  );

  return {
    filters,
    setSearch,
    setSessionId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    resetFilters,
  };
};
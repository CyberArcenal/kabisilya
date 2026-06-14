// src/renderer/pages/finance/worker-payments/hooks/usePaymentsFilters.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const DEBOUNCE_MS = 300;

export const usePaymentsFilters = () => {
  const [searchParams] = useSearchParams();

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

  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    workerId: useRef<NodeJS.Timeout>(),
    sessionId: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    startDate: useRef<NodeJS.Timeout>(),
    endDate: useRef<NodeJS.Timeout>(),
  };

  // Sync URL changes to state (browser back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlWorker = searchParams.get("worker");
    const urlSession = searchParams.get("session");
    const urlStatus = searchParams.get("status") || "";
    const urlStartDate = searchParams.get("startDate") || "";
    const urlEndDate = searchParams.get("endDate") || "";

    if (urlSearch !== search) setSearchState(urlSearch);
    const newWorkerId = urlWorker ? parseInt(urlWorker, 10) : undefined;
    if (newWorkerId !== workerId) setWorkerIdState(newWorkerId);
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) setSessionIdState(newSessionId);
    if (urlStatus !== status) setStatusState(urlStatus);
    if (urlStartDate !== startDate) setStartDateState(urlStartDate);
    if (urlEndDate !== endDate) setEndDateState(urlEndDate);
  }, [searchParams]);

  const resetFilters = () => {
    setSearchState("");
    setWorkerIdState(undefined);
    setSessionIdState(undefined);
    setStatusState("");
    setStartDateState("");
    setEndDateState("");
  };

  // Debounced setters that accept a callback to update URL (passed from parent)
  const createSetter = <T,>(
    setter: (val: T) => void,
    ref: React.MutableRefObject<NodeJS.Timeout | undefined>,
    callback: (val: T) => void
  ) => (val: T) => {
    setter(val);
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => callback(val), DEBOUNCE_MS);
  };

  return {
    filters: { search, workerId, sessionId, status, startDate, endDate },
    setSearchRaw: setSearchState,
    setWorkerIdRaw: setWorkerIdState,
    setSessionIdRaw: setSessionIdState,
    setStatusRaw: setStatusState,
    setStartDateRaw: setStartDateState,
    setEndDateRaw: setEndDateState,
    resetFilters,
    createSetter,
    debounceRefs,
  };
};
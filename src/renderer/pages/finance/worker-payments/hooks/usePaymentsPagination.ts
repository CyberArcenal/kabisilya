// src/renderer/pages/finance/worker-payments/hooks/usePaymentsPagination.ts
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const usePaymentsPagination = () => {
  const [searchParams] = useSearchParams();

  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [limit, setLimitState] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 10;
  });

  // Sync from URL
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) setPageState(newPage);
    const urlLimit = searchParams.get("limit");
    const newLimit = urlLimit ? parseInt(urlLimit, 10) : 10;
    if (newLimit !== limit) setLimitState(newLimit);
  }, [searchParams]);

  const setPage = (newPage: number) => setPageState(newPage);
  const setLimit = (newLimit: number) => setLimitState(newLimit);

  return { page, limit, setPage, setLimit };
};
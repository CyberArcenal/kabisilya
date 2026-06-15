// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentPagination.ts
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useWorkerPaymentPagination = () => {
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [limit, setLimit] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 10;
  });

  useEffect(() => {
    const urlPage = searchParams.get("page");
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) setPage(newPage);
    const urlLimit = searchParams.get("limit");
    const newLimit = urlLimit ? parseInt(urlLimit, 10) : 10;
    if (newLimit !== limit) setLimit(newLimit);
  }, [searchParams]);

  return { page, limit, setPage, setLimit };
};
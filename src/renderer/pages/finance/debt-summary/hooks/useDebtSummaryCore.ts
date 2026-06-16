import { useState, useCallback, useRef } from "react";
import debtAPI from "../../../../api/core/debt";
import {
  aggregateByWorker,
  type WorkerDebtSummary,
} from "../utils/aggregateDebts";

export const useDebtSummaryCore = () => {
  const [workers, setWorkers] = useState<WorkerDebtSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWorkers = useCallback(
    async (params: {
      page: number;
      limit: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
      search?: string;
      sessionId?: number;
      status?: string;
      dueDateStart?: string;
      dueDateEnd?: string;
      minAmount?: number;
      maxAmount?: number;
    }) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading(true);

      try {
        // Fetch all debts matching filters (large limit)
        const debtRes = await debtAPI.getAll({
          search: params.search,
          sessionId: params.sessionId,
          status: params.status,
          dueDateStart: params.dueDateStart,
          dueDateEnd: params.dueDateEnd,
          minAmount: params.minAmount,
          maxAmount: params.maxAmount,
          limit: 10000,
        });
        if (controller.signal.aborted) return;
        if (!debtRes.status) throw new Error(debtRes.message);

        const allDebts = debtRes.data.items;
        let summaries = aggregateByWorker(allDebts);

        // Apply frontend sorting
        if (params.sortBy) {
          const order = params.sortOrder === "ASC" ? 1 : -1;
          summaries.sort((a, b) => {
            let aVal: any, bVal: any;
            switch (params.sortBy) {
              case "workerName":
                aVal = a.workerName;
                bVal = b.workerName;
                break;
              case "debtCount":
                aVal = a.debtCount;
                bVal = b.debtCount;
                break;
              case "totalAmount":
                aVal = a.totalAmount;
                bVal = b.totalAmount;
                break;
              case "totalBalance":
                aVal = a.totalBalance;
                bVal = b.totalBalance;
                break;
              case "activeBalance":
                aVal = a.activeBalance;
                bVal = b.activeBalance;
                break;
              default:
                aVal = a.workerName;
                bVal = b.workerName;
            }
            if (aVal < bVal) return order === 1 ? -1 : 1;
            if (aVal > bVal) return order === 1 ? 1 : -1;
            return 0;
          });
        } else {
          // Default sort by workerName
          summaries.sort((a, b) => a.workerName.localeCompare(b.workerName));
        }

        // Apply frontend pagination
        const start = (params.page - 1) * params.limit;
        const paginated = summaries.slice(start, start + params.limit);
        setWorkers(paginated);
        setTotalCount(summaries.length);
        setTotalPages(Math.ceil(summaries.length / params.limit));
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch debt summaries", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [],
  );

  return { workers, loading, totalCount, totalPages, fetchWorkers };
};

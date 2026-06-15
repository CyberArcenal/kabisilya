// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentCore.ts
import { useState, useCallback, useRef } from "react";
import paymentAPI from "../../../../api/core/payment";
import debtAPI from "../../../../api/core/debt";
import { aggregateByWorker, type WorkerPaymentSummary } from "../utils/aggregatePayments";

export const useWorkerPaymentCore = () => {
  const [workers, setWorkers] = useState<WorkerPaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWorkers = useCallback(async (params: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    search?: string;
    sessionId?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      // 1. Fetch payments (no pagination, get all matching)
      const paymentsRes = await paymentAPI.getAll({
        search: params.search,
        sessionId: params.sessionId,
        startDate: params.startDate,
        endDate: params.endDate,
        limit: 10000,
      });
      if (controller.signal.aborted) return;
      if (!paymentsRes.status) throw new Error(paymentsRes.message);

      const allPayments = paymentsRes.data.items;
      let summaries = aggregateByWorker(allPayments);

      // 2. Fetch debts for all workers (to get outstanding balances)
      // We need to get pending and partially paid debts for all workers.
      // Since we have a list of worker IDs from summaries, we can fetch debts per worker.
      // To avoid many calls, we can fetch all debts with limit 10000 and aggregate by workerId.
      const debtRes = await debtAPI.getAll({ limit: 10000 });
      if (debtRes.status) {
        const allDebts = debtRes.data.items;
        // Build a map of workerId -> total debt balance (pending/partially paid only)
        const debtMap = new Map<number, number>();
        for (const debt of allDebts) {
          if (!debt.worker) continue;
          if (debt.status === "pending" || debt.status === "partially_paid") {
            const current = debtMap.get(debt.worker.id) || 0;
            debtMap.set(debt.worker.id, current + debt.balance);
          }
        }
        // Merge into summaries
        for (const summary of summaries) {
          summary.totalDebtBalance = debtMap.get(summary.workerId) || 0;
        }
      }

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
            case "totalGross":
              aVal = a.totalGross;
              bVal = b.totalGross;
              break;
            case "totalDebtDeduction":
              aVal = a.totalDebtDeduction;
              bVal = b.totalDebtDeduction;
              break;
            case "totalNet":
              aVal = a.totalNet;
              bVal = b.totalNet;
              break;
            case "totalPaid":
              aVal = a.totalPaid;
              bVal = b.totalPaid;
              break;
            case "paymentCount":
              aVal = a.paymentCount;
              bVal = b.paymentCount;
              break;
            case "totalOutstandingPayments":
              aVal = a.totalOutstandingPayments;
              bVal = b.totalOutstandingPayments;
              break;
            case "totalDebtBalance":
              aVal = a.totalDebtBalance;
              bVal = b.totalDebtBalance;
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
      console.error("Failed to fetch worker payment summaries", error);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  return { workers, loading, totalCount, totalPages, fetchWorkers };
};
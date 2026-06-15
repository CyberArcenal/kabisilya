// src/renderer/pages/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import type { DashboardData } from "../types";
import workerAPI from "../../../api/core/worker";
import assignmentAPI from "../../../api/core/assignment";
import paymentAPI from "../../../api/core/payment";
import debtAPI from "../../../api/core/debt";
import sessionAPI from "../../../api/core/session";
import auditLogAPI from "../../../api/core/audit";

const getCurrentMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: firstDay.toISOString().split("T")[0],
    endDate: lastDay.toISOString().split("T")[0],
  };
};

const fetchMonthlyTotals = async <T>(
  apiCall: (params: any) => Promise<any>,
  months: string[],
  getTotal: (items: any[]) => number,
) => {
  const results = await Promise.all(
    months.map(async (month) => {
      const start = `${month}-01`;
      const nextMonth = new Date(
        new Date(start).setMonth(new Date(start).getMonth() + 1),
      );
      const end = nextMonth.toISOString().slice(0, 10);
      const res = await apiCall({
        startDate: start,
        endDate: end,
        limit: 1000,
      });
      if (res.status && res.data.items) {
        return getTotal(res.data.items);
      }
      return 0;
    }),
  );
  return results;
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Basic data that doesn't depend on session
      const [workersRes, assignmentsStatsRes, activeAssignmentsRes, sessionRes] = await Promise.allSettled([
        workerAPI.getAll({ limit: 1 }),
        assignmentAPI.getStats(),
        assignmentAPI.getAll({ status: "active", limit: 1 }),
        sessionAPI.getActive(),
      ]);

      const totalWorkers =
        workersRes.status === "fulfilled" && workersRes.value.status
          ? workersRes.value.data.pagination?.total || 0
          : 0;

      const completedAssignments =
        assignmentsStatsRes.status === "fulfilled" && assignmentsStatsRes.value.status
          ? assignmentsStatsRes.value.data?.completed || 0
          : 0;

      const activeAssignments =
        activeAssignmentsRes.status === "fulfilled" && activeAssignmentsRes.value.status
          ? activeAssignmentsRes.value.data.pagination?.total || 0
          : 0;

      const currentSession =
        sessionRes.status === "fulfilled" && sessionRes.value.status
          ? sessionRes.value.data
          : null;

      // 2. Payments this month
      let totalPaymentsMonth = 0;
      try {
        const { startDate, endDate } = getCurrentMonthRange();
        const paymentsRes = await paymentAPI.getAll({
          startDate,
          endDate,
          limit: 1000,
        });
        if (paymentsRes.status && paymentsRes.data.items) {
          totalPaymentsMonth = paymentsRes.data.items.reduce(
            (sum, p) => sum + (p.grossPay || 0),
            0,
          );
        }
      } catch (err) {
        console.warn("Failed to fetch payments this month", err);
      }

      // 3. Debt stats (outstanding balance)
      let outstandingDebts = 0;
      try {
        const debtsRes = await debtAPI.getStats();
        if (debtsRes.status) {
          outstandingDebts = debtsRes.data.totalBalance || 0;
        }
      } catch (err) {
        console.warn("Failed to fetch debt stats", err);
      }

      // 4. Recent activities (audit log)
      let recentActivities: any[] = [];
      try {
        const recentRes = await auditLogAPI.getRecentActivity(10);
        if (recentRes.status) {
          recentActivities = recentRes.data.items || [];
        }
      } catch (err) {
        console.warn("Failed to fetch recent activities", err);
      }

      // 5. Monthly charts (last 6 months)
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7));
      }

      const monthlyAssignments = await fetchMonthlyTotals(
        assignmentAPI.getAll.bind(assignmentAPI),
        months,
        (items) => items.length,
      );
      const assignmentsPerMonth = months.map((m, idx) => ({
        month: new Date(m).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        assignments: monthlyAssignments[idx],
      }));

      const monthlyPayments = await fetchMonthlyTotals(
        paymentAPI.getAll.bind(paymentAPI),
        months,
        (items) => items.reduce((sum, p) => sum + (p.grossPay || 0), 0),
      );
      const monthlyDebts = await fetchMonthlyTotals(
        debtAPI.getAll.bind(debtAPI),
        months,
        (items) => items.reduce((sum, d) => sum + (d.amount || 0), 0),
      );
      const paymentsVsDebts = months.map((m, idx) => ({
        month: new Date(m).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        payments: monthlyPayments[idx],
        debts: monthlyDebts[idx],
      }));

      // 6. Top workers (by completed luwang in current session, or all-time if no session)
      let topWorkers: Array<{ name: string; totalLuwang: number }> = [];
      try {
        const sessionId = currentSession?.id;
        const assignmentsRes = await assignmentAPI.getAll({
          sessionId,
          status: "completed",
          limit: 1000, // enough to aggregate; adjust if needed
        });
        if (assignmentsRes.status && assignmentsRes.data.items.length) {
          const workerMap = new Map<number, { name: string; totalLuwang: number }>();
          for (const a of assignmentsRes.data.items) {
            if (a.worker && a.worker.id) {
              const existing = workerMap.get(a.worker.id);
              if (existing) {
                existing.totalLuwang += a.luwangCount;
              } else {
                workerMap.set(a.worker.id, {
                  name: a.worker.name,
                  totalLuwang: a.luwangCount,
                });
              }
            }
          }
          topWorkers = Array.from(workerMap.values())
            .sort((a, b) => b.totalLuwang - a.totalLuwang)
            .slice(0, 5);
        }
      } catch (err) {
        console.warn("Failed to fetch top workers", err);
      }

      // 7. Upcoming debts (pending/partial, due date >= today, limit 5)
      let upcomingDebts: Array<{ id: number; worker: string; amount: number; dueDays: number }> = [];
      try {
        const today = new Date().toISOString().slice(0, 10);
        const debtsRes = await debtAPI.getAll({
          status: "pending,partially_paid",
          dueDateStart: today,
          limit: 5,
          sortBy: "dueDate",
          sortOrder: "ASC",
        });
        if (debtsRes.status && debtsRes.data.items.length) {
          const nowMs = new Date().getTime();
          upcomingDebts = debtsRes.data.items.map((debt) => ({
            id: debt.id,
            worker: debt.worker?.name || "Unknown",
            amount: debt.balance,
            dueDays: Math.ceil((new Date(debt.dueDate!).getTime() - nowMs) / (1000 * 3600 * 24)),
          }));
        }
      } catch (err) {
        console.warn("Failed to fetch upcoming debts", err);
      }

      // 8. Set final state
      setData({
        totalWorkers,
        activeAssignments,
        completedAssignments,
        totalPaymentsMonth,
        outstandingDebts,
        currentSession,
        assignmentsPerMonth,
        paymentsVsDebts,
        recentActivities,
        topWorkers,
        upcomingDebts,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
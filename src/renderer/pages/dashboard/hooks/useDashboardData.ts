// src/renderer/pages/dashboard/hooks/useDashboardData.ts
import { useState, useEffect } from "react";
import workerAPI from "../../../api/core/worker";
import assignmentAPI from "../../../api/core/assignment";
import paymentAPI from "../../../api/core/payment";
import debtAPI from "../../../api/core/debt";
import sessionAPI from "../../../api/core/session";
import type { DashboardData } from "../types";
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
  getTotal: (items: any[]) => number
) => {
  const results = await Promise.all(
    months.map(async (month) => {
      const start = `${month}-01`;
      const nextMonth = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1));
      const end = nextMonth.toISOString().slice(0, 10);
      const res = await apiCall({ startDate: start, endDate: end, limit: 1000 });
      if (res.status && res.data.items) {
        return getTotal(res.data.items);
      }
      return 0;
    })
  );
  return results;
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          workersRes,
          assignmentsStatsRes,
          activeAssignmentsRes,
          paymentsMonthRes,
          debtsRes,
          sessionRes,
          recentRes,
        ] = await Promise.allSettled([
          workerAPI.getAll({ limit: 1 }),
          assignmentAPI.getStats(),
          assignmentAPI.getAll({ status: "active", limit: 1 }),
          (async () => {
            const { startDate, endDate } = getCurrentMonthRange();
            const res = await paymentAPI.getAll({ startDate, endDate, limit: 1000 });
            if (res.status && res.data.items) {
              return res.data.items.reduce((sum, p) => sum + (p.grossPay || 0), 0);
            }
            return 0;
          })(),
          debtAPI.getStats(),
          sessionAPI.getActive(),
          auditLogAPI.getRecentActivity(5),
        ]);

        const totalWorkers = workersRes.status === "fulfilled" && workersRes.value.status
          ? workersRes.value.data.pagination.total
          : 0;

        const completedAssignments = assignmentsStatsRes.status === "fulfilled" && assignmentsStatsRes.value.status
          ? assignmentsStatsRes.value.data.statusBreakdown?.completed || 0
          : 0;

        const activeAssignments = activeAssignmentsRes.status === "fulfilled" && activeAssignmentsRes.value.status
          ? activeAssignmentsRes.value.data.pagination.total
          : 0;

        const totalPaymentsMonth = paymentsMonthRes.status === "fulfilled" ? paymentsMonthRes.value : 0;

        const outstandingDebts = debtsRes.status === "fulfilled" && debtsRes.value.status
          ? debtsRes.value.data.totalBalance || 0
          : 0;

        const currentSession = sessionRes.status === "fulfilled" && sessionRes.value.status
          ? sessionRes.value.data
          : null;

        const recentActivities = recentRes.status === "fulfilled" && recentRes.value.status
          ? recentRes.value.data.items || []
          : [];

        // Generate last 6 months
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push(d.toISOString().slice(0, 7));
        }

        const monthlyAssignments = await fetchMonthlyTotals(
          assignmentAPI.getAll.bind(assignmentAPI),
          months,
          (items) => items.length // assignments count
        );
        const assignmentsPerMonth = months.map((m, idx) => ({
          month: new Date(m).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          assignments: monthlyAssignments[idx],
        }));

        const monthlyPayments = await fetchMonthlyTotals(
          paymentAPI.getAll.bind(paymentAPI),
          months,
          (items) => items.reduce((sum, p) => sum + (p.grossPay || 0), 0)
        );
        const monthlyDebts = await fetchMonthlyTotals(
          debtAPI.getAll.bind(debtAPI),
          months,
          (items) => items.reduce((sum, d) => sum + (d.amount || 0), 0)
        );
        const paymentsVsDebts = months.map((m, idx) => ({
          month: new Date(m).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          payments: monthlyPayments[idx],
          debts: monthlyDebts[idx],
        }));

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
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
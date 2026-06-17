// src/renderer/pages/reports/bukid/hooks/useBukidReports.ts
import { useState, useEffect, useCallback } from "react";
import { Sprout, MapPin, Wheat, Users } from "lucide-react";
import type { KPI, ProductionDataPoint, PitakSummary } from "../types";
import bukidAPI from "../../../../api/core/bukid";
import pitakAPI from "../../../../api/core/pitak";
import assignmentAPI from "../../../../api/core/assignment";

export const useBukidReports = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [productionData, setProductionData] = useState<ProductionDataPoint[]>([]);
  const [pitakSummary, setPitakSummary] = useState<PitakSummary[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Derived pagination values
  const totalItems = pitakSummary.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const bukidStatsRes = await bukidAPI.getStats();
      const pitaksRes = await pitakAPI.getAll({ limit: 1000 });

      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7));
      }
      const monthlyData: ProductionDataPoint[] = [];
      for (const month of months) {
        const start = `${month}-01`;
        const nextMonth = new Date(new Date(start).setMonth(new Date(start).getMonth() + 1));
        const end = nextMonth.toISOString().slice(0, 10);
        const assignmentsRes = await assignmentAPI.getAll({ startDate: start, endDate: end, limit: 1000 });
        let totalLuwang = 0;
        let assignmentCount = 0;
        if (assignmentsRes.status && assignmentsRes.data.items) {
          assignmentCount = assignmentsRes.data.items.length;
          totalLuwang = assignmentsRes.data.items.reduce((sum, a) => sum + a.luwangCount, 0);
        }
        monthlyData.push({
          month: new Date(month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          totalLuwang,
          assignmentCount,
        });
      }
      setProductionData(monthlyData);

      const pitakList = pitaksRes.status ? pitaksRes.data.items : [];
      const pitakSummaryData: PitakSummary[] = pitakList.map(p => ({
        id: p.id,
        location: p.location,
        totalLuwang: p.totalLuwang || 0,
        completedLuwang: 0,
        completionRate: 0,
        totalAssignments: 0,
        totalPayments: 0,
      }));
      setPitakSummary(pitakSummaryData);

      // Reset to first page when data changes
      setPage(1);

      const totalBukid = bukidStatsRes.status ? bukidStatsRes.data.total : 0;
      const activeBukid = bukidStatsRes.status ? bukidStatsRes.data?.active || 0 : 0;
      const totalPitaks = pitakList.length;

      setKpis([
        { title: "Total Farms", value: totalBukid, change: 0, icon: <MapPin className="w-5 h-5" />, color: "#3b82f6" },
        { title: "Active Farms", value: activeBukid, change: 0, icon: <Sprout className="w-5 h-5" />, color: "#10b981" },
        { title: "Total Plots", value: totalPitaks, change: 0, icon: <Wheat className="w-5 h-5" />, color: "#f59e0b" },
        { title: "Total Luwang", value: totalPitaks, change: 0, icon: <Users className="w-5 h-5" />, color: "#8b5cf6" },
      ]);
    } catch (error) {
      console.error("Failed to fetch bukid reports", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    kpis,
    productionData,
    pitakSummary,
    page,
    totalPages,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  };
};
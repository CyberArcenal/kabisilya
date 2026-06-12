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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch bukid stats (total bukids, active, etc.)
      const bukidStatsRes = await bukidAPI.getStats();
      // Fetch all pitaks to calculate summary
      const pitaksRes = await pitakAPI.getAll({ limit: 1000 });
      // Fetch assignments for last 6 months (for production chart)
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

      // Prepare pitak summary table
      const pitakList = pitaksRes.status ? pitaksRes.data.items : [];
      const pitakSummaryData: PitakSummary[] = pitakList.map(p => ({
        id: p.id,
        location: p.location,
        totalLuwang: p.totalLuwang || 0,
        completedLuwang: 0, // would need to fetch assignments per pitak to compute completed luwang
        completionRate: 0,
        totalAssignments: 0,
        totalPayments: 0,
      }));
      // For demo, we fill dummy data; in real implementation, fetch assignments for each pitak
      setPitakSummary(pitakSummaryData);
      setTotalPages(Math.ceil(pitakSummaryData.length / 10));

      // KPI cards
      const totalBukid = bukidStatsRes.status ? bukidStatsRes.data.totalBukids : 0;
      const activeBukid = bukidStatsRes.status ? bukidStatsRes.data.statusBreakdown?.active || 0 : 0;
      const totalPitaks = pitakList.length;
      const totalAssignments = pitakList.reduce((sum, p) => sum + (p.totalLuwang || 0), 0); // rough

      setKpis([
        { title: "Total Farms", value: totalBukid, change: 0, icon: <MapPin className="w-5 h-5" />, color: "#3b82f6" },
        { title: "Active Farms", value: activeBukid, change: 0, icon: <Sprout className="w-5 h-5" />, color: "#10b981" },
        { title: "Total Plots", value: totalPitaks, change: 0, icon: <Wheat className="w-5 h-5" />, color: "#f59e0b" },
        { title: "Total Luwang", value: totalAssignments, change: 0, icon: <Users className="w-5 h-5" />, color: "#8b5cf6" },
      ]);
    } catch (error) {
      console.error("Failed to fetch bukid reports", error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    setPage,
  };
};
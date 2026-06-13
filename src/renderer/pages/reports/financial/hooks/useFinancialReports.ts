// src/renderer/pages/analytics/financial/hooks/useFinancialReports.ts
import { useState, useEffect, useCallback } from "react";
import { financialAPI } from "../../../../api/analytics/financial";
import type { RevenueDataPoint, TopPayer, OverdueDebt, DateRange } from "../types";

export const useFinancialReports = (initialStartDate?: string, initialEndDate?: string) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueDataPoint[]>([]);
  const [topPayers, setTopPayers] = useState<TopPayer[]>([]);
  const [overdueDebts, setOverdueDebts] = useState<OverdueDebt[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: initialStartDate || getDefaultStartDate(),
    endDate: initialEndDate || getDefaultEndDate(),
  });

  function getDefaultStartDate() {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  }
  function getDefaultEndDate() {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, paymentSummaryRes, debtSummaryRes] = await Promise.all([
        financialAPI.getFinancialOverview({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        financialAPI.getRevenueTrend({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        financialAPI.getPaymentSummary({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        financialAPI.getDebtSummary({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
      ]);

      if (overviewRes.status) setOverview(overviewRes.data);
      if (revenueRes.status) {
        // Convert trendData to RevenueDataPoint[]
        setRevenueTrend(revenueRes.data.trendData || []);
      }
      if (paymentSummaryRes.status) {
        setTopPayers(paymentSummaryRes.data.topPayers || []);
      }
      if (debtSummaryRes.status) {
        setOverdueDebts(debtSummaryRes.data.overdueDebts || []);
      }
    } catch (error) {
      console.error("Failed to fetch financial reports", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDateRange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return {
    loading,
    overview,
    revenueTrend,
    topPayers,
    overdueDebts,
    dateRange,
    updateDateRange,
    refresh: fetchData,
  };
};
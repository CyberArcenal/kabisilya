// src/renderer/pages/analytics/workers/hooks/useWorkerPerformance.ts
import { useState, useEffect, useCallback } from "react";
import { workerPerformanceAPI } from "../../../../api/analytics/workerPerformance";
import type { WorkersOverview, TopPerformer, WorkerPerformanceRow } from "../types";

export const useWorkerPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<WorkersOverview | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [performance, setPerformance] = useState<WorkerPerformanceRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
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

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, topPerformersRes, performanceRes] = await Promise.all([
        workerPerformanceAPI.getWorkersOverview(),
        workerPerformanceAPI.getTopPerformers(),
        workerPerformanceAPI.getWorkerPerformance({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      ]);
      if (overviewRes.status) setOverview(overviewRes.data);
      if (topPerformersRes.status) {
        setTopPerformers(topPerformersRes.data.performers || []);
      }
      if (performanceRes.status) {
        setPerformance(performanceRes.data.performance || []);
      }
    } catch (error) {
      console.error("Failed to fetch worker performance", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDateRange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
    setPage(1);
  };

  const totalItems = performance.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedPerformance = performance.slice((page - 1) * pageSize, page * pageSize);

  return {
    loading,
    overview,
    topPerformers,
    performance: paginatedPerformance,
    allPerformance: performance,
    page,
    totalPages,
    totalItems,
    pageSize,
    dateRange,
    setPage,
    setPageSize,
    updateDateRange,
    refresh: fetchData,
  };
};
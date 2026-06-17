// src/renderer/pages/analytics/pitak/hooks/usePitakProductivity.ts
import { useState, useEffect, useCallback } from "react";
import { pitakAPI } from "../../../../api/analytics/pitak";
import type { PitakProductivityData } from "../types";

export const usePitakProductivity = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PitakProductivityData | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pitakAPI.getPitakProductivityOverview();
      if (res.status) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch pitak productivity", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const totalItems = data?.pitaks?.length || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedPitaks = data?.pitaks?.slice((page - 1) * pageSize, page * pageSize) || [];

  return {
    loading,
    overview: data?.summary,
    pitaks: paginatedPitaks,
    allPitaks: data?.pitaks || [],
    topPerformers: data?.topPerformers || [],
    financial: data?.financial,
    page,
    totalPages,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    refresh: fetchData,
  };
};
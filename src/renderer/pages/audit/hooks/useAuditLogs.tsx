// src/renderer/pages/audit/hooks/useAuditLogs.ts
import { useState, useEffect, useCallback } from "react";
import type { AuditFilters } from "../types";
import auditLogAPI, { type AuditLogEntry } from "../../../api/core/audit";

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AuditFilters>({
    search: "",
    entity: "",
    action: "",
    user: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogAPI.getAll({ limit: 1000, sortBy: "timestamp", sortOrder: "DESC" });
      if (res.status) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.description?.toLowerCase().includes(searchLower) ||
          log.entity?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.user?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.entity) {
      filtered = filtered.filter((log) => log.entity === filters.entity);
    }
    if (filters.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }
    if (filters.user) {
      filtered = filtered.filter((log) => log.user === filters.user);
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => new Date(log.timestamp) <= end);
    }

    setFilteredLogs(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setPage(1);
  }, [logs, filters, pageSize]);

  const updateFilters = (newFilters: Partial<AuditFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      entity: "",
      action: "",
      user: "",
      startDate: "",
      endDate: "",
    });
  };

  // Get distinct entities, actions, users for filter dropdowns
  const distinctEntities = [...new Set(logs.map((log) => log.entity).filter(Boolean))];
  const distinctActions = [...new Set(logs.map((log) => log.action).filter(Boolean))];
  const distinctUsers = [...new Set(logs.map((log) => log.user).filter(Boolean))];

  return {
    logs: filteredLogs,
    loading,
    page,
    pageSize,
    totalPages,
    filters,
    setPage,
    updateFilters,
    resetFilters,
    distinctEntities,
    distinctActions,
    distinctUsers,
    refresh: fetchLogs,
  };
};
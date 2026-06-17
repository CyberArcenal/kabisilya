// src/renderer/pages/audit/hooks/useAuditLogs.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type { AuditFilters } from "../types";
import auditLogAPI, { type AuditLogEntry } from "../../../api/core/audit";
import { showSuccess } from "../../../utils/notification";

export const useAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);           // items per page
  const [totalItems, setTotalItems] = useState(0);  // total filtered items
  const [filters, setFilters] = useState<AuditFilters>({
    search: "",
    entity: "",
    action: "",
    user: "",
    startDate: "",
    endDate: "",
  });

  // fetch raw logs (only once, on mount)
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogAPI.getAll({ limit: 10000, sortBy: "timestamp", sortOrder: "DESC" });
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

  // Apply filters and paginate
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

    // Sort by timestamp descending (already sorted, but keep)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
    setTotalItems(filtered.length);
    setPage(1); // reset to first page when filters change
  }, [logs, filters]);

  // Provide paginated slice
  const paginatedLogs = filteredLogs.slice((page - 1) * limit, page * limit);

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

  const refresh = () => fetchLogs();

  const exportCSV = () => {
    if (filteredLogs.length === 0) {
      showSuccess("No logs to export");
      return;
    }
    const headers = ["Timestamp", "User", "Action", "Entity", "Entity ID", "Description", "Previous Data", "New Data"];
    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.user || "",
      log.action,
      log.entity,
      log.entityId ?? "",
      log.description || "",
      log.previousData || "",
      log.newData || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Export started");
  };

  const distinctEntities = [...new Set(logs.map((log) => log.entity).filter(Boolean))];
  const distinctActions = [...new Set(logs.map((log) => log.action).filter(Boolean))];
  const distinctUsers = [...new Set(logs.map((log) => log.user).filter(Boolean))];

  return {
    logs: paginatedLogs,           // already sliced
    loading,
    page,
    limit,
    totalItems,
    filters,
    setPage,
    setLimit,
    updateFilters,
    resetFilters,
    distinctEntities,
    distinctActions,
    distinctUsers,
    refresh,
    exportCSV,
  };
};
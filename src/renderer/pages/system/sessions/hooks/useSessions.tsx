// src/renderer/pages/system/sessions/hooks/useSessions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { SessionWithDetails, SessionFormData } from "../types";
import sessionAPI from "../../../../api/core/session";

const DEBOUNCE_MS = 300;

export const useSessions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination & Sorting
  const [limit, setLimitState] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 10;
  });
  const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "startDate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(() =>
    (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC"
  );

  // Filters
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");

  // Stats for summary cards
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    closed: 0,
    archived: 0,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal states
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [editingSession, setEditingSession] = useState<(SessionFormData & { id: number }) | null>(null);
  const [statusChangeSession, setStatusChangeSession] = useState<SessionWithDetails | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
  };

  // URL update helper
  const updateUrl = useCallback(
    (newPage: number, newSearch: string, newStatus: string, newLimit: number, newSortBy: string, newSortOrder: "ASC" | "DESC") => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newStatus) params.status = newStatus;
      if (newPage > 1) params.page = newPage.toString();
      if (newLimit !== 10) params.limit = newLimit.toString();
      if (newSortBy !== "startDate") params.sortBy = newSortBy;
      if (newSortOrder !== "DESC") params.sortOrder = newSortOrder;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Sync URL changes to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";
    const urlLimit = searchParams.get("limit");
    const urlSortBy = searchParams.get("sortBy") || "startDate";
    const urlSortOrder = (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC";

    let needsUpdate = false;
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) { setPageState(newPage); needsUpdate = true; }
    if (urlSearch !== search) { setSearchState(urlSearch); needsUpdate = true; }
    if (urlStatus !== status) { setStatusState(urlStatus); needsUpdate = true; }
    const newLimit = urlLimit ? parseInt(urlLimit, 10) : 10;
    if (newLimit !== limit) { setLimitState(newLimit); needsUpdate = true; }
    if (urlSortBy !== sortBy) { setSortBy(urlSortBy); needsUpdate = true; }
    if (urlSortOrder !== sortOrder) { setSortOrder(urlSortOrder); needsUpdate = true; }
  }, [searchParams]);

  // Setters with URL update
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, status, limit, sortBy, sortOrder);
  };
  const setLimit = (newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
    updateUrl(1, search, status, newLimit, sortBy, sortOrder);
  };
  const setSort = (field: string) => {
    let newSortBy = field;
    let newSortOrder: "ASC" | "DESC" = "DESC";
    if (sortBy === field) {
      newSortOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    }
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPageState(1);
    updateUrl(1, search, status, limit, newSortBy, newSortOrder);
  };
  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(1, val, status, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(1, search, val, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const resetFilters = () => {
    setSearchState("");
    setStatusState("");
    setPageState(1);
    updateUrl(1, "", "", limit, sortBy, sortOrder);
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
      if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    };
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await sessionAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch sessions");

      setSessions(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch sessions", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await sessionAPI.getStats(); // Backend should return totals by status
      if (res.status && res.data) {
        setStats({
          total: res.data.totalSessions,
          active: res.data.statusBreakdown?.active || 0,
          closed: res.data.statusBreakdown?.closed || 0,
          archived: res.data.statusBreakdown?.archived || 0,
        });
      } else {
        // fallback compute from current sessions (not accurate but better than nothing)
        const total = sessions.length;
        const active = sessions.filter(s => s.status === "active").length;
        const closed = sessions.filter(s => s.status === "closed").length;
        const archived = sessions.filter(s => s.status === "archived").length;
        setStats({ total, active, closed, archived });
      }
    } catch (error) {
      console.error("Failed to fetch session stats", error);
    }
  }, [sessions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // CRUD handlers
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this session? This will also delete all related data (farms, plots, assignments, payments, debts). This action cannot be undone.",
    });
    if (confirmed) {
      try {
        await sessionAPI.delete(id);
        await fetchSessions();
      } catch (error) {
        console.error("Failed to delete session", error);
      }
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await sessionAPI.updateStatus(id, "active");
      await fetchSessions();
    } catch (error) {
      console.error("Failed to set session active", error);
    }
  };

  const handleView = (session: SessionWithDetails) => {
    setSelectedSession(session);
    viewModal.open();
  };

  const handleEdit = (session: SessionWithDetails) => {
    setEditingSession({
      id: session.id,
      name: session.name,
      year: session.year,
      startDate: session.startDate.split("T")[0],
      endDate: session.endDate ? session.endDate.split("T")[0] : "",
      seasonType: session.seasonType || "",
      status: session.status,
      notes: session.notes || "",
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingSession(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingSession(null);
    fetchSessions();
  };

  const handleChangeStatus = (session: SessionWithDetails) => {
    setStatusChangeSession(session);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeSession) return;
    await sessionAPI.updateStatus(statusChangeSession.id, newStatus);
    await fetchSessions();
    setStatusChangeSession(null);
  };

  // Bulk actions
  const bulkDelete = async (ids: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${ids.length} session(s)? This will also delete all related data.`,
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map(id => sessionAPI.delete(id)));
      await fetchSessions();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const bulkStatusChange = async (ids: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change ${ids.length} session(s) to "${newStatus}"?`,
      confirmText: "Change",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map(id => sessionAPI.updateStatus(id, newStatus)));
      await fetchSessions();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status change failed", error);
    }
  };

  const bulkExport = () => {
    const selected = sessions.filter(s => selectedIds.includes(s.id));
    if (selected.length === 0) return;
    const headers = ["ID", "Name", "Year", "Start Date", "End Date", "Season Type", "Status", "Notes", "Created At"];
    const rows = selected.map(s => [
      s.id,
      s.name,
      s.year,
      new Date(s.startDate).toLocaleDateString(),
      s.endDate ? new Date(s.endDate).toLocaleDateString() : "",
      s.seasonType || "",
      s.status,
      s.notes || "",
      new Date(s.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_sessions_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    const params: any = { limit: 10000, search, status, sortBy, sortOrder };
    const res = await sessionAPI.getAll(params);
    if (res.status && res.data.items.length) {
      const items = res.data.items;
      const headers = ["ID", "Name", "Year", "Start Date", "End Date", "Season Type", "Status", "Notes", "Created At"];
      const rows = items.map(s => [
        s.id,
        s.name,
        s.year,
        new Date(s.startDate).toLocaleDateString(),
        s.endDate ? new Date(s.endDate).toLocaleDateString() : "",
        s.seasonType || "",
        s.status,
        s.notes || "",
        new Date(s.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sessions_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      dialogs.error("No data to export");
    }
  };

  return {
    sessions,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    stats,
    limit,
    sortBy,
    sortOrder,
    selectedIds,
    setSelectedIds,
    selectedSession,
    editingSession,
    viewModal,
    formModal,
    statusChangeSession,
    statusModal,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setStatus,
    handleDelete,
    handleSetActive,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
    refetch: fetchSessions,
    exportToCSV,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
  };
};
// src/renderer/pages/workers/hooks/useWorkers.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import type { WorkerWithDetails, WorkerFormData } from "../types";
import workerAPI from "../../../api/core/worker";

const DEBOUNCE_MS = 300;

export const useWorkers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [workers, setWorkers] = useState<WorkerWithDetails[]>([]);
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
  const [sortBy, setSortBy] = useState(() => searchParams.get("sortBy") || "name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(() =>
    (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC"
  );

  // Filters
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");

  // Stats for summary cards
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    terminated: 0,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal states
  const [editingWorker, setEditingWorker] = useState<(WorkerFormData & { id: number }) | null>(null);
  const [statusChangeWorker, setStatusChangeWorker] = useState<WorkerWithDetails | null>(null);
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
      if (newSortBy !== "name") params.sortBy = newSortBy;
      if (newSortOrder !== "ASC") params.sortOrder = newSortOrder;
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
    const urlSortBy = searchParams.get("sortBy") || "name";
    const urlSortOrder = (searchParams.get("sortOrder") as "ASC" | "DESC") || "ASC";

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
    let newSortOrder: "ASC" | "DESC" = "ASC";
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

  // Fetch workers
  const fetchWorkers = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await workerAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch workers");

      setWorkers(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch workers", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, status]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await workerAPI.getStats(); // Backend should return totals by status
      if (res.status && res.data) {
        setStats({
          total: res.data.totalWorkers,
          active: res.data.statusBreakdown?.active || 0,
          onLeave: res.data.statusBreakdown?.["on-leave"] || 0,
          terminated: res.data.statusBreakdown?.terminated || 0,
        });
      } else {
        // fallback compute from current workers (not accurate for filtered)
        const total = workers.length;
        const active = workers.filter(w => w.status === "active").length;
        const onLeave = workers.filter(w => w.status === "on-leave").length;
        const terminated = workers.filter(w => w.status === "terminated").length;
        setStats({ total, active, onLeave, terminated });
      }
    } catch (error) {
      console.error("Failed to fetch worker stats", error);
    }
  }, [workers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // CRUD handlers
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Worker",
      message: "Are you sure you want to delete this worker? This action cannot be undone.",
    });
    if (confirmed) {
      try {
        await workerAPI.delete(id);
        await fetchWorkers();
      } catch (error) {
        console.error("Failed to delete worker", error);
      }
    }
  };

  const handleView = (worker: WorkerWithDetails) => {
    viewModal.setSelected(worker.id);
    viewModal.open();
  };

  const handleEdit = (worker: WorkerWithDetails) => {
    setEditingWorker({
      id: worker.id,
      name: worker.name,
      contact: worker.contact || "",
      email: worker.email || "",
      address: worker.address || "",
      status: worker.status,
      hireDate: worker.hireDate || "",
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingWorker(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingWorker(null);
    fetchWorkers();
    fetchStats();
  };

  const handleChangeStatus = (worker: WorkerWithDetails) => {
    setStatusChangeWorker(worker);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeWorker) return;
    await workerAPI.updateStatus(statusChangeWorker.id, newStatus);
    await fetchWorkers();
    setStatusChangeWorker(null);
  };

  // Bulk actions
  const bulkDelete = async (ids: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${ids.length} worker(s)? This action cannot be undone.`,
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map(id => workerAPI.delete(id)));
      await fetchWorkers();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  const bulkStatusChange = async (ids: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change ${ids.length} worker(s) to "${newStatus}"?`,
      confirmText: "Change",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map(id => workerAPI.updateStatus(id, newStatus)));
      await fetchWorkers();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status change failed", error);
    }
  };

  const bulkExport = () => {
    const selected = workers.filter(w => selectedIds.includes(w.id));
    if (selected.length === 0) return;
    const headers = ["ID", "Name", "Contact", "Email", "Address", "Status", "Hire Date", "Created At"];
    const rows = selected.map(w => [
      w.id,
      w.name,
      w.contact || "",
      w.email || "",
      w.address || "",
      w.status,
      w.hireDate ? new Date(w.hireDate).toLocaleDateString() : "",
      new Date(w.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_workers_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    const params: any = { limit: 10000, search, status, sortBy, sortOrder };
    const res = await workerAPI.getAll(params);
    if (res.status && res.data.items.length) {
      const items = res.data.items;
      const headers = ["ID", "Name", "Contact", "Email", "Address", "Status", "Hire Date", "Created At"];
      const rows = items.map(w => [
        w.id,
        w.name,
        w.contact || "",
        w.email || "",
        w.address || "",
        w.status,
        w.hireDate ? new Date(w.hireDate).toLocaleDateString() : "",
        new Date(w.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workers_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      dialogs.error("No data to export");
    }
  };

  return {
    workers,
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
    editingWorker,
    viewModal,
    formModal,
    statusChangeWorker,
    statusModal,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setStatus,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
    refetch: fetchWorkers,
    exportToCSV,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
  };
};
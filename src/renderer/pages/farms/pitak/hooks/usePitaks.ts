// src/renderer/pages/farms/pitak/hooks/usePitaks.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { PitakWithWorkers } from "../types";
import pitakAPI, { type PitakCreateData } from "../../../../api/core/pitak";
import assignmentAPI from "../../../../api/core/assignment";
import type { Worker } from "../../../../api/core/worker";
import { showError } from "../../../../utils/notification";

const DEBOUNCE_MS = 300;

export const usePitaks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Data state
  const [pitaks, setPitaks] = useState<PitakWithWorkers[]>([]);
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
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sortBy") || "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    () => (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC",
  );

  // Filters
  const [search, setSearchState] = useState(
    () => searchParams.get("search") || "",
  );
  const [bukidId, setBukidIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("bukid");
    return id ? parseInt(id, 10) : undefined;
  });
  const [status, setStatusState] = useState(
    () => searchParams.get("status") || "",
  );
  const [sessionId, setSessionIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });

  // Stats for summary cards
  const [stats, setStats] = useState({
    totalPlots: 0,
    activePlots: 0,
    completedPlots: 0,
    totalArea: 0,
    totalWorkers: 0,
  });

  // Modal states
  const [selectedPitak, setSelectedPitak] = useState<PitakWithWorkers | null>(
    null,
  );
  const [editingPitak, setEditingPitak] = useState<
    (PitakCreateData & { id: number }) | null
  >(null);
  const [statusChangePitak, setStatusChangePitak] =
    useState<PitakWithWorkers | null>(null);
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    bukidId: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    sessionId: useRef<NodeJS.Timeout>(),
  };

  // URL update helper
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newBukidId: number | undefined,
      newStatus: string,
      newSessionId: number | undefined,
      newLimit: number,
      newSortBy: string,
      newSortOrder: "ASC" | "DESC",
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newBukidId) params.bukid = newBukidId.toString();
      if (newStatus) params.status = newStatus;
      if (newSessionId) params.session = newSessionId.toString();
      if (newPage > 1) params.page = newPage.toString();
      if (newLimit !== 10) params.limit = newLimit.toString();
      if (newSortBy !== "createdAt") params.sortBy = newSortBy;
      if (newSortOrder !== "DESC") params.sortOrder = newSortOrder;
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Sync URL changes to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlBukid = searchParams.get("bukid");
    const urlStatus = searchParams.get("status") || "";
    const urlSession = searchParams.get("session");
    const urlLimit = searchParams.get("limit");
    const urlSortBy = searchParams.get("sortBy") || "createdAt";
    const urlSortOrder =
      (searchParams.get("sortOrder") as "ASC" | "DESC") || "DESC";

    let needsUpdate = false;
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) {
      setPageState(newPage);
      needsUpdate = true;
    }
    if (urlSearch !== search) {
      setSearchState(urlSearch);
      needsUpdate = true;
    }
    const newBukidId = urlBukid ? parseInt(urlBukid, 10) : undefined;
    if (newBukidId !== bukidId) {
      setBukidIdState(newBukidId);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) {
      setSessionIdState(newSessionId);
      needsUpdate = true;
    }
    const newLimit = urlLimit ? parseInt(urlLimit, 10) : 10;
    if (newLimit !== limit) {
      setLimitState(newLimit);
      needsUpdate = true;
    }
    if (urlSortBy !== sortBy) {
      setSortBy(urlSortBy);
      needsUpdate = true;
    }
    if (urlSortOrder !== sortOrder) {
      setSortOrder(urlSortOrder);
      needsUpdate = true;
    }
  }, [searchParams]);

  // Setters with URL update
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(
      newPage,
      search,
      bukidId,
      status,
      sessionId,
      limit,
      sortBy,
      sortOrder,
    );
  };
  const setLimit = (newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
    updateUrl(
      1,
      search,
      bukidId,
      status,
      sessionId,
      newLimit,
      sortBy,
      sortOrder,
    );
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
    updateUrl(
      1,
      search,
      bukidId,
      status,
      sessionId,
      limit,
      newSortBy,
      newSortOrder,
    );
  };
  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(1, val, bukidId, status, sessionId, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setBukidId = (val: number | undefined) => {
    setBukidIdState(val);
    if (debounceRefs.bukidId.current)
      clearTimeout(debounceRefs.bukidId.current);
    debounceRefs.bukidId.current = setTimeout(() => {
      updateUrl(1, search, val, status, sessionId, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(1, search, bukidId, val, sessionId, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setSessionId = (val: number | undefined) => {
    setSessionIdState(val);
    if (debounceRefs.sessionId.current)
      clearTimeout(debounceRefs.sessionId.current);
    debounceRefs.sessionId.current = setTimeout(() => {
      updateUrl(1, search, bukidId, status, val, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const resetFilters = () => {
    setSearchState("");
    setBukidIdState(undefined);
    setStatusState("");
    setSessionIdState(undefined);
    setPageState(1);
    updateUrl(1, "", undefined, "", undefined, limit, sortBy, sortOrder);
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      Object.values(debounceRefs).forEach(
        (ref) => ref.current && clearTimeout(ref.current),
      );
    };
  }, []);

  // Fetch pitaks
  const fetchPitaks = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = { page, limit, sortBy, sortOrder };
      if (search) params.search = search;
      if (bukidId) params.bukidId = bukidId;
      if (status) params.status = status;
      if (sessionId) params.sessionId = sessionId;

      const pitakRes = await pitakAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!pitakRes.status)
        throw new Error(pitakRes.message || "Failed to fetch pitaks");

      const pitakList = pitakRes.data.items;
      setTotalCount(pitakRes.data.pagination.total);
      setTotalPages(pitakRes.data.pagination.pages);

      // Fetch assignments to get workers for each pitak
      const assignmentRes = await assignmentAPI.getAll({ limit: 1000 });
      if (controller.signal.aborted || !isMountedRef.current) return;
      const workersByPitak = new Map<number, Worker[]>();
      if (assignmentRes.status && assignmentRes.data.items) {
        assignmentRes.data.items.forEach((ass) => {
          if (ass.pitak?.id && ass.worker) {
            const list = workersByPitak.get(ass.pitak.id) || [];
            list.push(ass.worker);
            workersByPitak.set(ass.pitak.id, list);
          }
        });
      }
      const enriched = pitakList.map((pitak) => ({
        ...pitak,
        workers: workersByPitak.get(pitak.id) || [],
      }));
      setPitaks(enriched);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch pitaks", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, bukidId, status, sessionId]);

  useEffect(() => {
    fetchPitaks();
  }, [fetchPitaks]);

  // Fetch stats for summary cards
  const fetchStats = useCallback(async () => {
    try {
      const params: any = {};
      if (bukidId) params.bukidId = bukidId;
      if (status) params.status = status;
      if (sessionId) params.sessionId = sessionId;
      if (search) params.search = search;
      const res = await pitakAPI.getStats(params); // requires backend implementation
      console.log(res)
      if (res.status && res.data) {
        setStats({
          totalPlots: res.data.total,
          activePlots: res.data.active,
          completedPlots: res.data.completed,
          totalArea: res.data.totalArea,
          totalWorkers: 0, // optional
        });
      }
    } catch (error) {
      console.error("Failed to fetch pitak stats", error);
    }
  }, [bukidId, status, sessionId, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  // CRUD handlers (unchanged)
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Plot",
      message:
        "Are you sure you want to delete this plot? This action cannot be undone.",
    });
    if (confirmed) {
      try {
        await pitakAPI.delete(id);
        await fetchPitaks();
      } catch (error) {
        console.error("Failed to delete plot", error);
      }
    }
  };

  const handleView = (pitak: PitakWithWorkers) => {
    setSelectedPitak(pitak);
    viewModal.open();
  };

  const handleEdit = (pitak: PitakWithWorkers) => {
    setEditingPitak({
      id: pitak.id,
      bukidId: pitak.bukid?.id || 0,
      location: pitak.location || "",
      area: pitak.area,
      totalLuwang: pitak.totalLuwang,
      description: pitak.description || "",
      status: pitak.status,
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingPitak(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingPitak(null);
    fetchPitaks();
    fetchStats();
  };

  const handleChangeStatus = (pitak: PitakWithWorkers) => {
    setStatusChangePitak(pitak);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangePitak) return;
    try {
      await pitakAPI.updateStatus(statusChangePitak.id, newStatus as any);
      await fetchPitaks();
      setStatusChangePitak(null);
    } catch (err: any) {
      showError(err.message);
    }
  };

  // Bulk actions
  const bulkDelete = async (ids: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${ids.length} plot(s)? This action cannot be undone.`,
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map((id) => pitakAPI.delete(id)));
      await fetchPitaks();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed", error);
      dialogs.error("Failed to delete plots");
    }
  };

  const bulkStatusChange = async (ids: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change ${ids.length} plot(s) to "${newStatus}"?`,
      confirmText: "Change",
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        ids.map((id) => pitakAPI.updateStatus(id, newStatus as any)),
      );
      await fetchPitaks();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status change failed", error);
      dialogs.error("Failed to change status");
    }
  };

  const bulkExport = () => {
    const selectedPlots = pitaks.filter((p) => selectedIds.includes(p.id));
    if (selectedPlots.length === 0) return;
    const headers = [
      "ID",
      "Location",
      "Farm",
      "Area (luwang)",
      "Status",
      "Created At",
    ];
    const rows = selectedPlots.map((p) => [
      p.id,
      p.location,
      p.bukid?.name || "",
      p.totalLuwang ?? "",
      p.status,
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_pitaks_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportToCSV = async () => {
    const params: any = {
      limit: 10000,
      search,
      bukidId,
      status,
      sessionId,
      sortBy,
      sortOrder,
    };
    const res = await pitakAPI.getAll(params);
    if (res.status) {
      const items = res.data.items;
      const headers = [
        "ID",
        "Location",
        "Farm",
        "Area (luwang)",
        "Status",
        "Created At",
      ];
      const rows = items.map((p) => [
        p.id,
        p.location,
        p.bukid?.name || "",
        p.totalLuwang ?? "",
        p.status,
        new Date(p.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pitaks_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      dialogs.error("Failed to export plots");
    }
  };

  return {
    pitaks,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, bukidId, status, sessionId },
    stats,
    limit,
    sortBy,
    sortOrder,
    selectedPitak,
    editingPitak,
    viewModal,
    formModal,
    statusChangePitak,
    statusModal,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setBukidId,
    setStatus,
    setSessionId,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
    refetch: fetchPitaks,
    exportToCSV,
  };
};

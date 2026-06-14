// src/renderer/pages/farms/bukid/hooks/useBukids.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import bukidAPI, { type Bukid } from "../../../../api/core/bukid";
import pitakAPI, { type Pitak } from "../../../../api/core/pitak";

export interface BukidWithPitaks extends Bukid {
  pitaks?: Pitak[];
}

const DEBOUNCE_MS = 300;

export const useBukids = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // Data state
  const [bukids, setBukids] = useState<BukidWithPitaks[]>([]);
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
  const [status, setStatusState] = useState(
    () => searchParams.get("status") || "",
  );
  const [sessionId, setSessionIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });

  // Stats for summary cards
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeFarms: 0,
    completedFarms: 0,
    totalArea: 0,
    totalPitaks: 0,
  });

  // Modal states
  const [selectedBukid, setSelectedBukid] = useState<BukidWithPitaks | null>(
    null,
  );
  const [editingBukid, setEditingBukid] = useState<{
    id: number;
    name: string;
    sessionId: number;
    status: string;
    location?: string;
    area?: number;
    description?: string;
  } | null>(null);
  const [statusChangeBukid, setStatusChangeBukid] =
    useState<BukidWithPitaks | null>(null);
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    sessionId: useRef<NodeJS.Timeout>(),
  };

  // URL update helper
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newStatus: string,
      newSessionId: number | undefined,
      newLimit: number,
      newSortBy: string,
      newSortOrder: "ASC" | "DESC",
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
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
    updateUrl(newPage, search, status, sessionId, limit, sortBy, sortOrder);
  };
  const setLimit = (newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
    updateUrl(1, search, status, sessionId, newLimit, sortBy, sortOrder);
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
    updateUrl(1, search, status, sessionId, limit, newSortBy, newSortOrder);
  };
  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(1, val, status, sessionId, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(1, search, val, sessionId, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const setSessionId = (val: number | undefined) => {
    setSessionIdState(val);
    if (debounceRefs.sessionId.current)
      clearTimeout(debounceRefs.sessionId.current);
    debounceRefs.sessionId.current = setTimeout(() => {
      updateUrl(1, search, status, val, limit, sortBy, sortOrder);
      setPageState(1);
    }, DEBOUNCE_MS);
  };
  const resetFilters = () => {
    setSearchState("");
    setStatusState("");
    setSessionIdState(undefined);
    setPageState(1);
    updateUrl(1, "", "", undefined, limit, sortBy, sortOrder);
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

  // Fetch bukids
  const fetchBukids = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (status) params.status = status;
      if (sessionId) params.sessionId = sessionId;

      const bukidRes = await bukidAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!bukidRes.status)
        throw new Error(bukidRes.message || "Failed to fetch bukids");

      const bukidList = bukidRes.data.items;
      setTotalCount(bukidRes.data.pagination.total);
      setTotalPages(bukidRes.data.pagination.pages);

      // Fetch pitaks for each bukid (or rely on backend includePitaks? We'll keep separate fetch for now)
      const pitakRes = await pitakAPI.getAll({ limit: 1000 });
      if (controller.signal.aborted || !isMountedRef.current) return;
      const pitaksByBukid = new Map<number, Pitak[]>();
      if (pitakRes.status && pitakRes.data.items) {
        pitakRes.data.items.forEach((pitak) => {
          if (pitak.bukid?.id) {
            const list = pitaksByBukid.get(pitak.bukid.id) || [];
            list.push(pitak);
            pitaksByBukid.set(pitak.bukid.id, list);
          }
        });
      }
      const enriched = bukidList.map((b) => {
        const pitaksForBukid = pitaksByBukid.get(b.id) || [];
        const totalLuwang = pitaksForBukid.reduce(
          (sum, pitak) => sum + (pitak.totalLuwang || 0),
          0,
        );
        return {
          ...b,
          pitaks: pitaksForBukid,
          area: totalLuwang > 0 ? totalLuwang : b.area,
        };
      });
      setBukids(enriched);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch bukids", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [page, limit, sortBy, sortOrder, search, status, sessionId]);

  useEffect(() => {
    fetchBukids();
  }, [fetchBukids]);

  // Fetch stats for summary cards
  const fetchStats = useCallback(async () => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (sessionId) params.sessionId = sessionId;
      if (search) params.search = search;
      const res = await bukidAPI.getStats(params); // We need to implement getStats in bukidAPI
      if (res.status && res.data) {
        setStats({
          totalFarms: res.data.total,
          activeFarms: res.data.active,
          completedFarms: res.data.completed,
          totalArea: res.data.totalArea,
          totalPitaks: 0, // optional
        });
      }
    } catch (error) {
      console.error("Failed to fetch bukid stats", error);
    }
  }, [status, sessionId, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  // CRUD handlers (unchanged)
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Farm",
      message:
        "Are you sure you want to delete this farm? This action cannot be undone.",
    });
    if (confirmed) {
      try {
        await bukidAPI.delete(id);
        await fetchBukids();
      } catch (error) {
        console.error("Failed to delete farm", error);
      }
    }
  };

  const handleView = (bukid: BukidWithPitaks) => {
    setSelectedBukid(bukid);
    viewModal.open();
  };

  const handleEdit = (bukid: BukidWithPitaks) => {
    setEditingBukid({
      id: bukid.id,
      name: bukid.name,
      sessionId: bukid.session?.id || 0,
      status: bukid.status,
      location: bukid.location || "",
      area: bukid.area || undefined,
      description: bukid.description || "",
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingBukid(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingBukid(null);
    fetchBukids();
    fetchStats();
  };

  const handleChangeStatus = (bukid: BukidWithPitaks) => {
    setStatusChangeBukid(bukid);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeBukid) return;
    await bukidAPI.updateStatus(statusChangeBukid.id, newStatus);
    await fetchBukids();
    setStatusChangeBukid(null);
  };

  // Bulk actions
  const bulkDelete = async (ids: number[]) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Are you sure you want to delete ${ids.length} farm(s)? This action cannot be undone.`,
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map((id) => bukidAPI.delete(id)));
      await fetchBukids();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk delete failed", error);
      dialogs.error("Failed to delete farms");
    }
  };

  const bulkStatusChange = async (ids: number[], newStatus: string) => {
    const confirmed = await dialogs.confirm({
      title: "Bulk Status Change",
      message: `Change ${ids.length} farm(s) to "${newStatus}"?`,
      confirmText: "Change",
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map((id) => bukidAPI.updateStatus(id, newStatus)));
      await fetchBukids();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status change failed", error);
      dialogs.error("Failed to change status");
    }
  };

  const bulkExport = () => {
    const selectedBukids = bukids.filter((b) => selectedIds.includes(b.id));
    if (selectedBukids.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Location",
      "Status",
      "Session",
      "Total Luwang",
      "Created At",
    ];
    const rows = selectedBukids.map((b) => [
      b.id,
      b.name,
      b.location || "",
      b.status,
      b.session?.name || "",
      b.area ?? "",
      new Date(b.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selected_bukids_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const exportToCSV = async () => {
    const params: any = {
      limit: 10000,
      search,
      status,
      sessionId,
      sortBy,
      sortOrder,
    };
    const res = await bukidAPI.getAll(params);
    if (res.status) {
      const items = res.data.items;
      const headers = [
        "ID",
        "Name",
        "Location",
        "Status",
        "Session",
        "Total Luwang",
        "Created At",
      ];
      const rows = items.map((b) => [
        b.id,
        b.name,
        b.location || "",
        b.status,
        b.session?.name || "",
        b.area ?? "",
        new Date(b.createdAt).toLocaleDateString(),
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bukids_export_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      dialogs.error("Failed to export farms");
    }
  };

  return {
    bukids,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status, sessionId },
    stats,
    limit,
    sortBy,
    sortOrder,
    selectedBukid,
    editingBukid,
    viewModal,
    formModal,
    statusChangeBukid,
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
    refetch: fetchBukids,
    exportToCSV,
  };
};

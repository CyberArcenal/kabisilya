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

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const useBukids = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [bukids, setBukids] = useState<BukidWithPitaks[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearchState] = useState(
    () => searchParams.get("search") || "",
  );
  const [status, setStatusState] = useState(
    () => searchParams.get("status") || "",
  );

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
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const statusDebounceRef = useRef<NodeJS.Timeout>();
  const isUpdatingFromUrlRef = useRef(false); // prevent loops

  // Helper: update URL with current filters
  const updateUrl = useCallback(
    (newPage: number, newSearch: string, newStatus: string) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newStatus) params.status = newStatus;
      if (newPage > 1) params.page = newPage.toString();
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  // Sync URL changes (browser back/forward) to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";

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
    // If URL changed externally, mark that we're updating from URL
    if (needsUpdate) {
      isUpdatingFromUrlRef.current = true;
      // Fetch will happen via the effect that depends on page/search/status
    }
  }, [searchParams]); // runs when URL changes

  // Setters that update state and URL (for user interactions)
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, status);
  };

  const setSearch = (val: string) => {
    setSearchState(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateUrl(1, val, status);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    statusDebounceRef.current = setTimeout(() => {
      updateUrl(1, search, val);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setSearchState("");
    setStatusState("");
    setPageState(1);
    updateUrl(1, "", "");
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    };
  }, []);

  // Fetch data
  const fetchBukids = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const bukidRes = await bukidAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!bukidRes.status)
        throw new Error(bukidRes.message || "Failed to fetch bukids");

      const bukidList = bukidRes.data.items;
      setTotalCount(bukidRes.data.pagination.total);
      setTotalPages(bukidRes.data.pagination.pages);

      // Fetch pitaks
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

      const enriched = bukidList.map((b) => ({
        ...b,
        pitaks: pitaksByBukid.get(b.id) || [],
      }));

      if (!controller.signal.aborted && isMountedRef.current) {
        setBukids(enriched);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch bukids", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
      isUpdatingFromUrlRef.current = false;
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchBukids();
  }, [fetchBukids]);

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

  return {
    bukids,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    selectedBukid,
    editingBukid,
    viewModal,
    formModal,
    statusChangeBukid,
    statusModal,
    setPage,
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
  };
};

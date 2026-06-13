// src/renderer/pages/farms/pitak/hooks/usePitaks.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { PitakWithWorkers, PitakFormData } from "../types";
import pitakAPI from "../../../../api/core/pitak";
import assignmentAPI from "../../../../api/core/assignment";
import type { Worker } from "../../../../api/core/worker";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const usePitaks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [pitaks, setPitaks] = useState<PitakWithWorkers[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters (initialized from URL)
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

  // Selected pitak for modals
  const [selectedPitak, setSelectedPitak] = useState<PitakWithWorkers | null>(
    null,
  );
  const [editingPitak, setEditingPitak] = useState<
    (PitakFormData & { id: number }) | null
  >(null);
  const [statusChangePitak, setStatusChangePitak] =
    useState<PitakWithWorkers | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs for abort control and debounce
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const bukidDebounceRef = useRef<NodeJS.Timeout>();
  const statusDebounceRef = useRef<NodeJS.Timeout>();

  // Helper: update URL with current filters
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newBukidId: number | undefined,
      newStatus: string,
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newBukidId) params.bukid = newBukidId.toString();
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
    const urlBukid = searchParams.get("bukid");
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
    const newBukidId = urlBukid ? parseInt(urlBukid, 10) : undefined;
    if (newBukidId !== bukidId) {
      setBukidIdState(newBukidId);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
  }, [searchParams]); // runs when URL changes (back/forward)

  // Setters that update state and URL (for user interactions)
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, bukidId, status);
  };

  const setSearch = (val: string) => {
    setSearchState(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateUrl(1, val, bukidId, status);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setBukidId = (val: number | undefined) => {
    setBukidIdState(val);
    if (bukidDebounceRef.current) clearTimeout(bukidDebounceRef.current);
    bukidDebounceRef.current = setTimeout(() => {
      updateUrl(1, search, val, status);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    statusDebounceRef.current = setTimeout(() => {
      updateUrl(1, search, bukidId, val);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setSearchState("");
    setBukidIdState(undefined);
    setStatusState("");
    setPageState(1);
    updateUrl(1, "", undefined, "");
  };

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (bukidDebounceRef.current) clearTimeout(bukidDebounceRef.current);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    };
  }, []);

  // Fetch pitaks
  const fetchPitaks = useCallback(async () => {
    // Cancel previous request
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
      if (bukidId) params.bukidId = bukidId;
      if (status) params.status = status;

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

      if (!controller.signal.aborted && isMountedRef.current) {
        setPitaks(enriched);
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch pitaks", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, bukidId, status]);

  useEffect(() => {
    fetchPitaks();
  }, [fetchPitaks]);

  // CRUD Handlers
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
    area: pitak.area,                     // keep for backward compatibility
    totalLuwang: pitak.totalLuwang,       // ✅ add this line
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
  };

  const handleChangeStatus = (pitak: PitakWithWorkers) => {
    setStatusChangePitak(pitak);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangePitak) return;
    await pitakAPI.updateStatus(statusChangePitak.id, newStatus as any);
    await fetchPitaks();
    setStatusChangePitak(null);
  };

  return {
    // Data
    pitaks,
    loading,
    page,
    totalPages,
    totalCount,
    // Filters
    filters: { search, bukidId, status },
    // Setters
    setPage,
    setSearch,
    setBukidId,
    setStatus,
    // Modal states and handlers
    selectedPitak,
    editingPitak,
    viewModal,
    formModal,
    statusChangePitak,
    statusModal,
    handleChangeStatus,
    handleConfirmStatusChange,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch: fetchPitaks,
  };
};

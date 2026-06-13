// src/renderer/pages/workers/hooks/useWorkers.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import type { WorkerWithDetails, WorkerFormData } from "../types";
import workerAPI from "../../../api/core/worker";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const useWorkers = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [workers, setWorkers] = useState<WorkerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters (initialized from URL)
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");

  const [editingWorker, setEditingWorker] = useState<(WorkerFormData & { id: number }) | null>(null);
  const [statusChangeWorker, setStatusChangeWorker] = useState<WorkerWithDetails | null>(null);

  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const statusDebounceRef = useRef<NodeJS.Timeout>();

  const updateUrl = useCallback(
    (newPage: number, newSearch: string, newStatus: string) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newStatus) params.status = newStatus;
      if (newPage > 1) params.page = newPage.toString();
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

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
  }, [searchParams]);

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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    };
  }, []);

  const fetchWorkers = useCallback(async () => {
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
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

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
    viewModal.setSelected(worker.id)
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

  return {
    workers,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    editingWorker,
    viewModal,
    formModal,
    statusChangeWorker,
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
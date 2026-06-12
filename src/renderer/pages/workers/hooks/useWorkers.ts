// src/renderer/pages/workers/hooks/useWorkers.ts
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import type { WorkerWithDetails, WorkerFormData } from "../types";
import workerAPI from "../../../api/core/worker";

export const useWorkers = () => {
  const [workers, setWorkers] = useState<WorkerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // Selected worker for modals
  const [selectedWorker, setSelectedWorker] = useState<WorkerWithDetails | null>(null);
  const [editingWorker, setEditingWorker] = useState<(WorkerFormData & { id: number }) | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await workerAPI.getAll(params);
      if (!res.status) throw new Error(res.message || "Failed to fetch workers");

      setWorkers(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch workers", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Worker",
      message: "Are you sure you want to delete this worker?",
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
    setSelectedWorker(worker);
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

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return {
    workers,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    setPage,
    setSearch,
    setStatus,
    selectedWorker,
    editingWorker,
    viewModal,
    formModal,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
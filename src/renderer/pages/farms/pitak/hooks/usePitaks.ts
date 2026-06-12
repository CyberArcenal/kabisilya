// src/renderer/pages/farms/pitak/hooks/usePitaks.ts
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { PitakWithWorkers, PitakFormData } from "../types";
import pitakAPI from "../../../../api/core/pitak";
import assignmentAPI from "../../../../api/core/assignment";
import type { Worker } from "../../../../api/core/worker";

export const usePitaks = () => {
  const [pitaks, setPitaks] = useState<PitakWithWorkers[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [bukidId, setBukidId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");

  // Selected pitak for modals
  const [selectedPitak, setSelectedPitak] = useState<PitakWithWorkers | null>(null);
  const [editingPitak, setEditingPitak] = useState<(PitakFormData & { id: number }) | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();

  const fetchPitaks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (bukidId) params.bukidId = bukidId;
      if (status) params.status = status;

      const pitakRes = await pitakAPI.getAll(params);
      if (!pitakRes.status) throw new Error(pitakRes.message || "Failed to fetch pitaks");

      const pitakList = pitakRes.data.items;
      setTotalCount(pitakRes.data.pagination.total);
      setTotalPages(pitakRes.data.pagination.pages);

      // Fetch assignments to get workers for each pitak
      const assignmentRes = await assignmentAPI.getAll({ limit: 1000 });
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
    } catch (error) {
      console.error("Failed to fetch pitaks", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, bukidId, status]);

  useEffect(() => {
    fetchPitaks();
  }, [fetchPitaks]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Plot",
      message: "Are you sure you want to delete this plot? This action cannot be undone.",
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

  const resetFilters = () => {
    setSearch("");
    setBukidId(undefined);
    setStatus("");
    setPage(1);
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
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
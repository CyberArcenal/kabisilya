// src/renderer/pages/farms/bukid/hooks/useBukids.ts
import { useState, useEffect, useCallback } from 'react';
import { useModal } from '../../../../hooks/useModal';
import { dialogs } from '../../../../utils/dialogs';
import bukidAPI, { type Bukid } from '../../../../api/core/bukid';
import pitakAPI, { type Pitak } from '../../../../api/core/pitak';

export interface BukidWithPitaks extends Bukid {
  pitaks?: Pitak[];
}

export const useBukids = () => {
  const [bukids, setBukids] = useState<BukidWithPitaks[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Selected bukid for modals
  const [selectedBukid, setSelectedBukid] = useState<BukidWithPitaks | null>(null);
  const [editingBukid, setEditingBukid] = useState<{ id: number; name: string; sessionId: number; status: string; location?: string; area?: number; description?: string } | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();

  const fetchBukids = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const bukidRes = await bukidAPI.getAll(params);
      if (!bukidRes.status) throw new Error(bukidRes.message || 'Failed to fetch bukids');

      const bukidList = bukidRes.data.items;
      setTotalCount(bukidRes.data.pagination.total);
      setTotalPages(bukidRes.data.pagination.pages);

      // Fetch pitaks to attach to bukids (for plots column)
      const pitakRes = await pitakAPI.getAll({ limit: 1000 });
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
      setBukids(enriched);
    } catch (error) {
      console.error('Failed to fetch bukids', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status]);

  useEffect(() => {
    fetchBukids();
  }, [fetchBukids]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: 'Delete Farm',
      message: 'Are you sure you want to delete this farm? This action cannot be undone.',
    });
    if (confirmed) {
      try {
        await bukidAPI.delete(id);
        await fetchBukids();
      } catch (error) {
        console.error('Failed to delete farm', error);
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
      location: bukid.location || '',
      area: bukid.area || undefined,
      description: bukid.description || '',
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

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  return {
    // State
    bukids,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    selectedBukid,
    editingBukid,
    // Modal states
    viewModal,
    formModal,
    // Setters
    setPage,
    setSearch,
    setStatus,
    // Handlers
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
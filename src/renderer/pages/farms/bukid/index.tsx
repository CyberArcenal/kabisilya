// src/renderer/pages/farms/bukid/index.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, X, RefreshCw } from "lucide-react"; // added RefreshCw
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { useBukids, type BukidWithPitaks } from "./hooks/useBukids";
import BukidTable from "./components/BukidTable";
import BukidFormModal from "./components/BukidFormModal";
import BukidViewModal from "./components/ViewBukidModal";
import PitakViewModal from "../pitak/components/PitakViewModal";
import { useModal } from "../../../hooks/useModal";
import pitakAPI from "../../../api/core/pitak";
import type { Pitak } from "../../../api/core/pitak";
import ChangeStatusModal from "./components/ChangeStatusModal";
import ViewWorkerModal from "../../workers/components/ViewWorkerModal";

const BukidPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    bukids,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedBukid,
    editingBukid,
    viewModal,
    formModal,
    statusChangeBukid,
    statusModal,
    handleChangeStatus,
    handleConfirmStatusChange,
    setPage,
    setSearch,
    setStatus,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch, // <-- add refetch
  } = useBukids();

  const pitakModal = useModal();
  const workerModal = useModal();
  const [selectedPitak, setSelectedPitak] = useState<Pitak | null>(null);
  const [loadingPitak, setLoadingPitak] = useState(false);
  const hasFilters = !!(filters.search || filters.status);

  const handlePitakClick = async (pitakId: number) => {
    setLoadingPitak(true);
    try {
      const res = await pitakAPI.getById(pitakId);
      if (res.status && res.data) {
        setSelectedPitak(res.data);
        pitakModal.open();
      }
    } catch (error) {
      console.error("Failed to fetch pitak details", error);
    } finally {
      setLoadingPitak(false);
    }
  };

  const handleWorkerClickFromModal = (worker: any) => {
    workerModal.setSelected(worker.id);
    workerModal.open();
  };

  const handleViewPlots = (bukidId: number) => {
    navigate(`/farms/pitak?bukid=${bukidId}`);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Farm Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage all farms (bukid) and their plots</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>Add Farm</Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-1.5 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors text-[var(--text-secondary)]"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name or location..."
            value={filters.search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
          <select
            value={filters.status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          >
            <option value="">All Status</option>
            <option value="initiated">Initiated</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {hasFilters && (
          <div className="flex justify-end">
            <button onClick={resetFilters} className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="medium" /></div>
      ) : (
        <>
          <BukidTable
            bukids={bukids}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPitakClick={handlePitakClick}
            onChangeStatus={handleChangeStatus}
            onViewPlots={handleViewPlots}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">Total: {totalCount} farm{totalCount !== 1 ? "s" : ""}</div>
        </>
      )}

      {/* Modals */}
      <BukidViewModal isOpen={viewModal.isOpen} onClose={viewModal.close} bukid={selectedBukid} onPitakClick={handlePitakClick} />
      <BukidFormModal isOpen={formModal.isOpen} onClose={formModal.close} onSuccess={handleFormSuccess} initialData={editingBukid} />
      {!loadingPitak && (
        <PitakViewModal isOpen={pitakModal.isOpen} onClose={pitakModal.close} pitak={selectedPitak} onWorkerClick={handleWorkerClickFromModal} />
      )}
      <ChangeStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        bukidName={statusChangeBukid?.name || ""}
        currentStatus={statusChangeBukid?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
      <ViewWorkerModal
        isOpen={workerModal.isOpen}
        onClose={workerModal.close}
        workerId={workerModal.selectedId ? workerModal.selectedId : null}
      />
    </div>
  );
};

export default BukidPage;
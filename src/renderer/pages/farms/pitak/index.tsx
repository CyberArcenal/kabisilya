// src/renderer/pages/farms/pitak/index.tsx
import React from "react";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import BukidSelect from "../../../components/Selects/BukidSelect";
import { usePitaks } from "./hooks/usePitaks";
import PitakTable from "./components/PitakTable";
import PitakFormModal from "./components/PitakFormModal";
import PitakViewModal from "./components/PitakViewModal";
import { useNavigate } from "react-router-dom";
import type { Worker } from "../../../api/core/worker";
import ViewAssignmentModal from "../../../components/Modals/ViewAssignmentModal";
import { useModal } from "../../../hooks/useModal";
import ViewWorkerModal from "../../workers/components/ViewWorkerModal";
import ChangePitakStatusModal from "./components/ChangePitakStatusModal";

const PitakPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pitaks,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedPitak,
    editingPitak,
    viewModal,
    formModal,
    statusChangePitak,
    statusModal,
    handleChangeStatus,
    handleConfirmStatusChange,
    setPage,
    setSearch,
    setBukidId,
    setStatus,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  } = usePitaks();

  const viewAssigmentModal = useModal();
  const workerViewModal = useModal();

  const hasFilters = !!(filters.search || filters.bukidId || filters.status);

  const handleWorkerClick = (worker: Worker) => {
    workerViewModal.setSelected(worker.id);
    workerViewModal.open();
  };

  const handleViewAllWorkers = (pitakId: number) => {
  navigate(`/farms/assignments?pitak=${pitakId}`);
};

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Plot Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage all plots (pitak) and their assigned workers
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>
          Add Plot
        </Button>
      </div>

      {/* Filters Bar (inline, same as Bukid) */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by location..."
            value={filters.search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
          <BukidSelect
            value={filters.bukidId || null}
            onChange={(id) => {
              setBukidId(id || undefined);
              setPage(1);
            }}
            placeholder="All farms"
          />
          <select
            value={filters.status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {hasFilters && (
          <div className="flex justify-end">
            <button
              onClick={resetFilters}
              className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <PitakTable
            pitaks={pitaks}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onWorkerClick={handleWorkerClick}
            onChangeStatus={handleChangeStatus}
            onViewAllWorkers={handleViewAllWorkers}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} plot{totalCount !== 1 ? "s" : ""}
          </div>
        </>
      )}

      {/* Modals */}
      <PitakViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        pitak={selectedPitak}
        onWorkerClick={handleWorkerClick}
      />
      <PitakFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={editingPitak}
      />
      <ViewAssignmentModal
        isOpen={viewAssigmentModal.isOpen}
        onClose={() => viewAssigmentModal.close()}
        assignmentId={
          viewAssigmentModal.selectedId ? viewAssigmentModal.selectedId : null
        }
      />
      <ViewWorkerModal
        isOpen={workerViewModal.isOpen}
        onClose={workerViewModal.close}
        workerId={
          workerViewModal.selectedId ? workerViewModal.selectedId : null
        }
      />
      <ChangePitakStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        pitakLocation={statusChangePitak?.location || ""}
        currentStatus={statusChangePitak?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default PitakPage;

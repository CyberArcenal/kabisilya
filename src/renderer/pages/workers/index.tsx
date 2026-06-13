// src/renderer/pages/workers/index.tsx
import React from "react";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../components/UI/Button";
import Pagination from "../../components/UI/Pagination";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { useWorkers } from "./hooks/useWorkers";
import WorkerTable from "./components/WorkerTable";
import CreateWorkerModal from "./components/CreateWorkerModal";
import ViewWorkerModal from "./components/ViewWorkerModal";
import ChangeWorkerStatusModal from "./components/ChangeWorkerStatusModal";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on-leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

const WorkersPage: React.FC = () => {
  const {
    workers,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
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
  } = useWorkers();

  const hasFilters = !!(filters.search || filters.status);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Worker Directory</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage all farm workers</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>
          Add Worker
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name, email or contact..."
            value={filters.search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
          <select
            value={filters.status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <WorkerTable
            workers={workers}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} worker{totalCount !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Modals */}
      <ViewWorkerModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        workerId={viewModal.selectedId? viewModal.selectedId:null}
      />
      <CreateWorkerModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={editingWorker}
      />
      <ChangeWorkerStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        workerName={statusChangeWorker?.name || ""}
        currentStatus={statusChangeWorker?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default WorkersPage;
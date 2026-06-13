// src/renderer/pages/system/sessions/index.tsx
import React from "react";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { useSessions } from "./hooks/useSessions";
import SessionTable from "./components/SessionTable";
import CreateSessionModal from "./components/CreateSessionModal";
import ViewSessionModal from "./components/ViewSessionModal";
import ChangeSessionStatusModal from "./components/ChangeSessionStatusModal";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const SessionsPage: React.FC = () => {
  const {
    sessions,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedSession,
    editingSession,
    viewModal,
    formModal,
    statusChangeSession,
    statusModal,
    setPage,
    setSearch,
    setStatus,
    handleDelete,
    handleSetActive,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
  } = useSessions();

  const hasFilters = !!(filters.search || filters.status);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Session Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage farming seasons / sessions</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>
          Add Session
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
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
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="medium" /></div>
      ) : (
        <>
          <SessionTable
            sessions={sessions}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetActive={handleSetActive}
            onChangeStatus={handleChangeStatus}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">Total: {totalCount} session{totalCount !== 1 ? "s" : ""}</div>
        </>
      )}

      <ViewSessionModal isOpen={viewModal.isOpen} onClose={viewModal.close} session={selectedSession} />
      <CreateSessionModal isOpen={formModal.isOpen} onClose={formModal.close} onSuccess={handleFormSuccess} initialData={editingSession} />
      <ChangeSessionStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        sessionName={statusChangeSession?.name || ""}
        currentStatus={statusChangeSession?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default SessionsPage;
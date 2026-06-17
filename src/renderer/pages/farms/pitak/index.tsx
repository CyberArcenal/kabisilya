// src/renderer/pages/farms/pitak/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Filter,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import BukidSelect from "../../../components/Selects/BukidSelect";
import SessionSelect from "../../../components/Selects/SessionSelect";
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
import BulkAssignModal from "../assignments/components/BulkAssignModal";
import PitakAssignmentsModal from "./components/PitakAssignmentsModal";
import type { PitakWithWorkers } from "./types";
import BulkActionsBar from "./components/BulkActionsBar";
import PitakSummaryCards from "./components/PitakSummaryCards";
import { usePagination } from "../../../contexts/PaginationContext";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PitakPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    limit,
    pitaks,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    stats,
    selectedPitak,
    editingPitak,
    viewModal,
    formModal,
    statusChangePitak,
    statusModal,
    selectedIds,
    setLimit,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    handleChangeStatus,
    handleConfirmStatusChange,
    setPage,
    setSearch,
    setBukidId,
    setStatus,
    setSessionId,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch,
    exportToCSV,
  } = usePitaks();

  const viewAssignmentModal = useModal();
  const workerViewModal = useModal();
  const bulkAssignModal = useModal();
  const assignmentsModal = useModal();
  const [selectedPitakForAssignments, setSelectedPitakForAssignments] =
    useState<{ id: number; location: string } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = !!(
    filters.search ||
    filters.bukidId ||
    filters.status ||
    filters.sessionId
  );

    const { setPagination, clearPagination } = usePagination();
  
    // Stable callbacks – they depend on setPage/setLimit which should be stable
    const handlePageChange = useCallback(
      (newPage: number) => {
        setPage(newPage);
      },
      [setPage],
    );
  
    const handlePageSizeChange = useCallback(
      (newSize: number) => {
        setLimit(newSize);
        setPage(1);
      },
      [setLimit, setPage],
    );
  
    // Store the latest handlers in a ref so the effect can always use the current ones
    const handlersRef = useRef({
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    });
    useEffect(() => {
      handlersRef.current = {
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      };
    }, [handlePageChange, handlePageSizeChange]);
  
    // Track previous primitive values to avoid unnecessary updates
    const prevPageRef = useRef(page);
    const prevTotalRef = useRef(totalCount);
    const prevLimitRef = useRef(limit);
  
    // Effect that only runs when primitive pagination data changes
    useEffect(() => {
      const pageChanged = prevPageRef.current !== page;
      const totalChanged = prevTotalRef.current !== totalCount;
      const limitChanged = prevLimitRef.current !== limit;
  
      if (pageChanged || totalChanged || limitChanged) {
        // Update refs
        prevPageRef.current = page;
        prevTotalRef.current = totalCount;
        prevLimitRef.current = limit;
  
        // Call setPagination with current primitives and the latest handlers from ref
        setPagination({
          currentPage: page,
          totalItems: totalCount,
          pageSize: limit,
          onPageChange: handlersRef.current.onPageChange,
          onPageSizeChange: handlersRef.current.onPageSizeChange,
          pageSizeOptions: [10, 25, 50, 100],
          showPageSize: true,
        });
      }
    }, [page, totalCount, limit, setPagination]); // Only these dependencies matter
  
    // Clear pagination on unmount
    useEffect(() => {
      return () => clearPagination();
    }, [clearPagination]);

  const handleWorkerClick = (worker: Worker) => {
    workerViewModal.setSelected(worker.id);
    workerViewModal.open();
  };

  const handleViewAssignments = (pitak: PitakWithWorkers) => {
    setSelectedPitakForAssignments({ id: pitak.id, location: pitak.location });
    assignmentsModal.open();
  };

  const handleViewAllWorkers = (pitakId: number) => {
    navigate(`/farms/assignments?pitak=${pitakId}`);
  };

  const handleViewAssignment = (assignmentId: number) => {
    viewAssignmentModal.setSelected(assignmentId);
    viewAssignmentModal.open();
  };

  const handleBulkAssign = (pitak: any) => {
    bulkAssignModal.setInitial({
      pitakId: pitak.id,
      pitakLocation: pitak.location,
    });
    bulkAssignModal.open();
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary cards" : "Show summary cards"}
          >
            {showStats ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Export all plots (current filters)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddNew}
          >
            Add Plot
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {showStats && (
        <PitakSummaryCards
          totalPlots={stats.totalPlots}
          activePlots={stats.activePlots}
          completedPlots={stats.completedPlots}
          totalArea={stats.totalArea}
        />
      )}

      {/* Filters Bar */}
      {showFilters && (
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
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SessionSelect
              value={filters.sessionId || null}
              onChange={(id) => {
                setSessionId(id || undefined);
                setPage(1);
              }}
              placeholder="All sessions"
            />
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
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onStatusChange={(newStatus) =>
            bulkStatusChange(selectedIds, newStatus)
          }
          onDelete={() => bulkDelete(selectedIds)}
          onExport={bulkExport}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

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
            onBulkAssign={handleBulkAssign}
            onViewAssignments={handleViewAssignments}
            selectedIds={selectedIds}
            onSelectRow={(id, checked) => {
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id),
              );
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? pitaks.map((p) => p.id) : []);
            }}
            onViewAssignment={handleViewAssignment}
          />
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
        isOpen={viewAssignmentModal.isOpen}
        onClose={() => viewAssignmentModal.close()}
        assignmentId={viewAssignmentModal.selectedId || null}
      />
      <ViewWorkerModal
        isOpen={workerViewModal.isOpen}
        onClose={workerViewModal.close}
        workerId={workerViewModal.selectedId || null}
      />
      <ChangePitakStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        pitakLocation={statusChangePitak?.location || ""}
        currentStatus={statusChangePitak?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
      <BulkAssignModal
        isOpen={bulkAssignModal.isOpen}
        onClose={bulkAssignModal.close}
        onSuccess={() => refetch()}
        initialData={bulkAssignModal.initialData}
      />
      <PitakAssignmentsModal
        isOpen={assignmentsModal.isOpen}
        onClose={assignmentsModal.close}
        pitakId={selectedPitakForAssignments?.id || 0}
        pitakLocation={selectedPitakForAssignments?.location || ""}
        onAssignmentDeleted={refetch}
      />
    </div>
  );
};

export default PitakPage;

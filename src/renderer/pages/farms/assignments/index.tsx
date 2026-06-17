// src/renderer/pages/farms/assignments/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Filter,
  X,
  Users,
  RefreshCw,
  Eye,
  Download,
  EyeOff,
} from "lucide-react"; // added RefreshCw
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import WorkerSelect from "../../../components/Selects/WorkerSelect";
import PitakSelect from "../../../components/Selects/PitakSelect";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { useAssignments } from "./hooks/useAssignments";
import AssignmentTable from "./components/AssignmentTable";
import CreateAssignmentModal from "./components/CreateAssignmentModal";
import BulkAssignModal from "./components/BulkAssignModal";
import type { AssignmentWithDetails } from "./types";
import ChangeAssignmentStatusModal from "./components/ChangeAssignmentStatusModal";
import { useModal } from "../../../hooks/useModal";
import ViewAssignmentModal from "../../../components/Modals/ViewAssignmentModal";
import AssignmentSummaryCards from "./components/AssignmentSummaryCards";
import BulkActionsBar from "./components/BulkActionsBar";
import { usePagination } from "../../../contexts/PaginationContext";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "initiated", label: "Initiated" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const AssignmentsPage: React.FC = () => {
  const {
    assignments,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedAssignment,
    editingAssignment,
    viewModal,
    formModal,
    bulkModal,
    statusChangeAssignment,
    statusModal,

    limit,
    setLimitState,
    setLimit,
    sortBy,
    sortOrder,
    setSortOrder,
    stats,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    setSort,
    handleChangeStatus,
    handleConfirmStatusChange,
    setPage,
    setSearch,
    setWorkerId,
    setPitakId,
    setSessionId,
    setStatus,
    setStartDate,
    setEndDate,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleBulkSuccess,
    resetFilters,
    exportToCSV,
    refetch, // <-- added
  } = useAssignments();

  const hasFilters = !!(
    filters.search ||
    filters.workerId ||
    filters.pitakId ||
    filters.sessionId ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  );



  const assignmentModal = useModal();
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const handleViewAssignment = (assignment: AssignmentWithDetails) => {
    assignmentModal.setSelected(assignment.id);
    assignmentModal.open();
  };


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

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Assignments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage worker assignments to plots
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
            variant="secondary"
            size="sm"
            icon={Users}
            onClick={bulkModal.open}
          >
            Bulk Assign
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddNew}
          >
            Add Assignment
          </Button>
        </div>
      </div>
      {showStats && (
        <AssignmentSummaryCards
          total={stats.total}
          active={stats.active}
          completed={stats.completed}
          totalLuwang={stats.totalLuwang}
          cancelled={stats.cancelled}
          initiated={stats.initiated}
        />
      )}
      {/* Filters Bar */}
      {showFilters && (
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
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search worker or plot..."
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
            <WorkerSelect
              value={filters.workerId || null}
              onChange={(id) => {
                setWorkerId(id || undefined);
                setPage(1);
              }}
              placeholder="All workers"
            />
            <PitakSelect
              value={filters.pitakId || null}
              onChange={(id) => {
                setPitakId(id || undefined);
                setPage(1);
              }}
              placeholder="All plots"
            />
            <SessionSelect
              value={filters.sessionId || null}
              onChange={(id) => {
                setSessionId(id || undefined);
                setPage(1);
              }}
              placeholder="All sessions"
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
            <input
              type="date"
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="date"
              placeholder="End date"
              value={filters.endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
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
          <AssignmentTable
            assignments={assignments}
            onView={handleViewAssignment}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
            onSort={setSort} // need setSort function from hook
            sortBy={sortBy}
            sortOrder={sortOrder}
            selectedIds={selectedIds}
            onSelectRow={(id, checked) => {
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id),
              );
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? assignments.map((a) => a.id) : []);
            }}
          />
        </>
      )}

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={editingAssignment}
      />
      <BulkAssignModal
        isOpen={bulkModal.isOpen}
        onClose={bulkModal.close}
        onSuccess={handleBulkSuccess}
      />
      <ChangeAssignmentStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        assignmentInfo={
          statusChangeAssignment
            ? `${statusChangeAssignment.worker?.name || "Unknown"} on ${statusChangeAssignment.pitak?.location || "Unknown Plot"}`
            : ""
        }
        currentStatus={statusChangeAssignment?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
      <ViewAssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => assignmentModal.close()}
        assignmentId={
          assignmentModal.selectedId ? assignmentModal.selectedId : null
        }
      />
    </div>
  );
};

export default AssignmentsPage;

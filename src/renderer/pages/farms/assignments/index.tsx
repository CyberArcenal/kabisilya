// src/renderer/pages/farms/assignments/index.tsx
import React from "react";
import { Plus, Filter, X, Users } from "lucide-react";
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

  const handleViewAssignment = (assignment: AssignmentWithDetails) => {
    // Simple alert for now; could open a view modal
    assignmentModal.setSelected(assignment.id);
    assignmentModal.open();
  };

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
          <Button
            variant="secondary"
            size="md"
            icon={Users}
            onClick={bulkModal.open}
          >
            Bulk Assign
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleAddNew}
          >
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Filters Bar (inline) */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
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
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} assignment{totalCount !== 1 ? "s" : ""}
          </div>
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
        onClose={() => {
          assignmentModal.close();
        }}
        assignmentId={
          assignmentModal.selectedId ? assignmentModal.selectedId : null
        }
      />
    </div>
  );
};

export default AssignmentsPage;

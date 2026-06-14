// src/renderer/pages/farms/pitak/components/PitakTable.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, User, Hash } from "lucide-react";
import type { PitakWithWorkers } from "../types";
import type { Worker } from "../../../../api/core/worker";
import type { Assignment } from "../../../../api/core/assignment";
import WorkerAvatarStack from "./WorkerAvatarStack";
import PitakActionsDropdown from "./PitakActionsDropdown";
import assignmentAPI from "../../../../api/core/assignment";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";

interface PitakTableProps {
  pitaks: PitakWithWorkers[];
  onView: (pitak: PitakWithWorkers) => void;
  onEdit: (pitak: PitakWithWorkers) => void;
  onDelete: (id: number) => void;
  onWorkerClick: (worker: Worker) => void;
  onChangeStatus: (pitak: PitakWithWorkers) => void;
  onViewAllWorkers?: (pitakId: number) => void;
  onBulkAssign?: (pitak: PitakWithWorkers) => void;
  onViewAssignments?: (pitak: PitakWithWorkers) => void;
  // Sorting
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Selection
  selectedIds?: number[];
  onSelectRow?: (id: number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  // View assignment modal (passed from parent)
  onViewAssignment?: (assignmentId: number) => void;
}

const statusBadge = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    active: { bg: "#d1fae5", text: "#065f46" },
    completed: { bg: "#dbeafe", text: "#1e40af" },
    cancelled: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = colors[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString();
};

const PitakTable: React.FC<PitakTableProps> = ({
  pitaks,
  onView,
  onEdit,
  onDelete,
  onWorkerClick,
  onChangeStatus,
  onViewAllWorkers,
  onBulkAssign,
  onViewAssignments,
  onSort,
  sortBy,
  sortOrder,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onViewAssignment,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [assignmentsCache, setAssignmentsCache] = useState<Record<number, Assignment[]>>({});
  const [loadingAssignments, setLoadingAssignments] = useState<Record<number, boolean>>({});

  if (pitaks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No plots found
      </div>
    );
  }

  const allSelected = pitaks.length > 0 && pitaks.every((p) => selectedIds.includes(p.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleExpand = async (pitakId: number) => {
    if (expandedRowId === pitakId) {
      setExpandedRowId(null);
      return;
    }
    setExpandedRowId(pitakId);
    // Fetch assignments if not cached
    if (!assignmentsCache[pitakId]) {
      setLoadingAssignments((prev) => ({ ...prev, [pitakId]: true }));
      try {
        const res = await assignmentAPI.getByPitak(pitakId, { limit: 100, sortBy: "assignmentDate", sortOrder: "DESC" });
        if (res.status && res.data) {
          setAssignmentsCache((prev) => ({ ...prev, [pitakId]: res.data.items }));
        } else {
          setAssignmentsCache((prev) => ({ ...prev, [pitakId]: [] }));
        }
      } catch (error) {
        console.error("Failed to fetch assignments", error);
        setAssignmentsCache((prev) => ({ ...prev, [pitakId]: [] }));
      } finally {
        setLoadingAssignments((prev) => ({ ...prev, [pitakId]: false }));
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-3 px-4 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("location")}
            >
              Location {sortBy === "location" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("bukid.name")}
            >
              Farm {sortBy === "bukid.name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("area")}
            >
              Area (luwang) {sortBy === "area" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("status")}
            >
              Status {sortBy === "status" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Assigned Workers
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pitaks.map((pitak) => {
            const isExpanded = expandedRowId === pitak.id;
            const assignments = assignmentsCache[pitak.id] || [];
            const loading = loadingAssignments[pitak.id];
            return (
              <React.Fragment key={pitak.id}>
                <tr className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
                  <td className="py-2.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pitak.id)}
                      onChange={(e) => onSelectRow?.(pitak.id, e.target.checked)}
                      className="rounded border-[var(--border-color)] cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      <span>{pitak.location}</span>
                      {pitak.status === "active" && (
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">{pitak.bukid?.name || "—"}</td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">{pitak.totalLuwang ?? "—"}</td>
                  <td className="py-2.5 px-4">{statusBadge(pitak.status)}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-1">
                      <WorkerAvatarStack
                        workers={pitak.workers || []}
                        pitakId={pitak.id}
                        pitakLocation={pitak.location}
                        onWorkerClick={onWorkerClick}
                        onViewAllWorkers={onViewAllWorkers}
                      />
                      {(pitak.workers?.length ?? 0) > 0 && (
                        <button
                          onClick={() => toggleExpand(pitak.id)}
                          className="p-1 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
                          title={isExpanded ? "Hide assignments" : "Show assignments"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <PitakActionsDropdown
                      pitak={pitak}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onChangeStatus={onChangeStatus}
                      onBulkAssign={onBulkAssign}
                      onViewAssignments={onViewAssignments}
                    />
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-[var(--card-secondary-bg)]/50">
                    <td colSpan={7} className="p-0">
                      <div className="p-4 border-t border-[var(--border-color)]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
                            Assignments for {pitak.location}
                          </h4>
                          <button
                            onClick={() => onViewAssignments?.(pitak)}
                            className="text-xs text-[var(--primary-color)] hover:underline"
                          >
                            View all assignments →
                          </button>
                        </div>
                        {loading ? (
                          <div className="flex justify-center py-4">
                            <LoadingSpinner size="small" />
                          </div>
                        ) : assignments.length === 0 ? (
                          <p className="text-sm text-[var(--text-tertiary)] py-2">No assignments found</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--card-secondary-bg)]">
                                <tr>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Worker</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Assignment Date</th>
                                  <th className="text-right py-2 px-3 text-[var(--text-secondary)]">Luwang</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Status</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {assignments.map((ass) => (
                                  <tr key={ass.id} className="border-t border-[var(--border-color)]">
                                    <td className="py-2 px-3">{ass.worker?.name || "—"}</td>
                                    <td className="py-2 px-3">{formatDate(ass.assignmentDate)}</td>
                                    <td className="py-2 px-3 text-right">{ass.luwangCount}</td>
                                    <td className="py-2 px-3">{statusBadge(ass.status)}</td>
                                    <td className="py-2 px-3">
                                      <button
                                        onClick={() => onViewAssignment?.(ass.id)}
                                        className="text-xs text-[var(--primary-color)] hover:underline"
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PitakTable;
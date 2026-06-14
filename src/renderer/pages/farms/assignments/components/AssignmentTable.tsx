// src/renderer/pages/farms/assignments/components/AssignmentTable.tsx
import React from "react";
import { Calendar } from "lucide-react";
import type { AssignmentWithDetails } from "../types";
import AssignmentActionsDropdown from "./AssignmentActionsDropdown";

interface AssignmentTableProps {
  assignments: AssignmentWithDetails[];
  onView: (assignment: AssignmentWithDetails) => void;
  onEdit: (assignment: AssignmentWithDetails) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (assignment: AssignmentWithDetails) => void;
  // Sorting
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Bulk selection
  selectedIds?: number[];
  onSelectRow?: (id: number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const statusColors: Record<string, { bg: string; text: string }> = {
  initiated: { bg: "#fef3c7", text: "#92400e" },
  active: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#dbeafe", text: "#1e40af" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusColors[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {status}
    </span>
  );
};

const AssignmentTable: React.FC<AssignmentTableProps> = ({
  assignments,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onSort,
  sortBy,
  sortOrder,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
}) => {
  if (!assignments?.length) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No assignments found
      </div>
    );
  }

  const allSelected = assignments.length > 0 && assignments.every((a) => selectedIds.includes(a.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

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
              onClick={() => onSort?.("worker.name")}
            >
              Worker {sortBy === "worker.name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("pitak.location")}
            >
              Plot {sortBy === "pitak.location" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("session.name")}
            >
              Session {sortBy === "session.name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("luwangCount")}
            >
              Luwang {sortBy === "luwangCount" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("assignmentDate")}
            >
              Assignment Date {sortBy === "assignmentDate" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("status")}
            >
              Status {sortBy === "status" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(assignment.id)}
                  onChange={(e) => onSelectRow?.(assignment.id, e.target.checked)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xs font-medium">
                    {assignment.worker ? getInitials(assignment.worker.name) : "?"}
                  </div>
                  <span className="text-[var(--text-primary)]">{assignment.worker?.name || "Unassigned"}</span>
                </div>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{assignment.pitak?.location || "—"}</td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{assignment.session?.name || "—"}</td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{assignment.luwangCount}</td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(assignment.assignmentDate).toLocaleDateString()}
                </div>
              </td>
              <td className="py-2.5 px-4"><StatusBadge status={assignment.status} /></td>
              <td className="py-2.5 px-4">
                <AssignmentActionsDropdown
                  assignment={assignment}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentTable;
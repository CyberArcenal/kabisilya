// src/renderer/pages/system/sessions/components/SessionTable.tsx
import React from "react";
import { Star, CheckCircle, XCircle, Clock } from "lucide-react";
import type { SessionWithDetails } from "../types";
import SessionActionsDropdown from "./SessionActionsDropdown";

interface SessionTableProps {
  sessions: SessionWithDetails[];
  onView: (session: SessionWithDetails) => void;
  onEdit: (session: SessionWithDetails) => void;
  onDelete: (id: number) => void;
  onSetActive: (id: number) => void;
  onChangeStatus: (session: SessionWithDetails) => void;
  // Sorting
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Selection
  selectedIds?: number[];
  onSelectRow?: (id: number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
}

const statusIcon: Record<string, React.ReactNode> = {
  active: <CheckCircle className="w-4 h-4 text-green-500" />,
  closed: <Clock className="w-4 h-4 text-orange-500" />,
  archived: <XCircle className="w-4 h-4 text-gray-500" />,
};

const SessionTable: React.FC<SessionTableProps> = ({
  sessions,
  onView,
  onEdit,
  onDelete,
  onSetActive,
  onChangeStatus,
  onSort,
  sortBy,
  sortOrder,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
}) => {
  if (sessions.length === 0) {
    return <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">No sessions found</div>;
  }

  const allSelected = sessions.length > 0 && sessions.every(s => selectedIds.includes(s.id));
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
                ref={(input) => { if (input) input.indeterminate = someSelected; }}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("name")}
            >
              Name {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("year")}
            >
              Year {sortBy === "year" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("seasonType")}
            >
              Season Type {sortBy === "seasonType" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("startDate")}
            >
              Start Date {sortBy === "startDate" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("endDate")}
            >
              End Date {sortBy === "endDate" && (sortOrder === "ASC" ? "↑" : "↓")}
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
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(session.id)}
                  onChange={(e) => onSelectRow?.(session.id, e.target.checked)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 font-medium">
                <div className="flex items-center gap-2">
                  {session.name}
                  {session.status === "active" && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
              </td>
              <td className="py-2.5 px-4">{session.year}</td>
              <td className="py-2.5 px-4">{session.seasonType || "—"}</td>
              <td className="py-2.5 px-4">{new Date(session.startDate).toLocaleDateString()}</td>
              <td className="py-2.5 px-4">{session.endDate ? new Date(session.endDate).toLocaleDateString() : "—"}</td>
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-1">
                  {statusIcon[session.status]}
                  <span className="capitalize">{session.status}</span>
                </div>
              </td>
              <td className="py-2.5 px-4">
                <SessionActionsDropdown
                  session={session}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSetActive={onSetActive}
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

export default SessionTable;
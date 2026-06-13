// src/renderer/pages/farms/pitak/components/PitakTable.tsx
import React from "react";
import type { PitakWithWorkers } from "../types";
import WorkerAvatarStack from "./WorkerAvatarStack";
import type { Worker } from "../../../../api/core/worker";
import PitakActionsDropdown from "./PitakActionsDropdown";

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
}) => {
  if (pitaks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No plots found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Location</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Farm</th>
       <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Area (luwang)</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Assigned Workers</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pitaks.map((pitak) => (
            <tr key={pitak.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                <div className="flex items-center gap-2">
                  <span>{pitak.location}</span>
                  {pitak.status === "active" && (
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Active" />
                  )}
                </div>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{pitak.bukid?.name || "—"}</td>
            <td className="py-2.5 px-4 text-[var(--text-secondary)]">
  {pitak.totalLuwang ?? '—'}
</td>
              <td className="py-2.5 px-4">{statusBadge(pitak.status)}</td>
              <td className="py-2.5 px-4">
                <WorkerAvatarStack
                  workers={pitak.workers || []}
                  pitakId={pitak.id}
                  pitakLocation={pitak.location}
                  onWorkerClick={onWorkerClick}
                  onViewAllWorkers={onViewAllWorkers}
                />
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PitakTable;
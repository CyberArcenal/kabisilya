// src/renderer/pages/workers/components/WorkerTable.tsx
import React from "react";
import { Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import type { WorkerWithDetails } from "../types";

interface WorkerTableProps {
  workers: WorkerWithDetails[];
  onView: (worker: WorkerWithDetails) => void;
  onEdit: (worker: WorkerWithDetails) => void;
  onDelete: (id: number) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  inactive: { bg: "#f3f4f6", text: "#6b7280", dot: "#9ca3af" },
  "on-leave": { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  terminated: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusColors[status] || statusColors.inactive;
  return (
    <span className="px-2 py-1 text-xs rounded-full inline-flex items-center gap-1" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dot }} />
      {status}
    </span>
  );
};

const WorkerTable: React.FC<WorkerTableProps> = ({
  workers,
  onView,
  onEdit,
  onDelete,
}) => {
  if (workers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No workers found
      </div>
    );
  }

  const handleCall = (contact?: string) => {
    if (contact) window.open(`tel:${contact}`);
  };

  const handleEmail = (email?: string) => {
    if (email) window.open(`mailto:${email}`);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Contact</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Address</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white text-sm font-medium"
                  >
                    {getInitials(worker.name)}
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{worker.name}</span>
                </div>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {worker.contact || "—"}
                {worker.contact && (
                  <button
                    onClick={() => handleCall(worker.contact)}
                    className="ml-2 p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]"
                    title="Call"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {worker.email || "—"}
                {worker.email && (
                  <button
                    onClick={() => handleEmail(worker.email)}
                    className="ml-2 p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]"
                    title="Email"
                  >
                    <Mail className="w-3 h-3" />
                  </button>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{worker.address || "—"}</td>
              <td className="py-2.5 px-4">
                <StatusBadge status={worker.status} />
              </td>
              <td className="py-2.5 px-4">
                <div className="flex gap-2">
                  <button onClick={() => onView(worker)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(worker)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(worker.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerTable;
// src/renderer/pages/system/sessions/components/SessionTable.tsx
import React from "react";
import { Eye, Edit, Trash2, Star, CheckCircle, XCircle, Clock } from "lucide-react";
import type { SessionWithDetails } from "../types";

interface SessionTableProps {
  sessions: SessionWithDetails[];
  onView: (session: SessionWithDetails) => void;
  onEdit: (session: SessionWithDetails) => void;
  onDelete: (id: number) => void;
  onSetActive: (id: number) => void;
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
}) => {
  if (sessions.length === 0) {
    return <div className="text-center py-8 text-[var(--text-tertiary)]">No sessions found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Year</th>
            <th className="text-left py-3 px-4">Season Type</th>
            <th className="text-left py-3 px-4">Start Date</th>
            <th className="text-left py-3 px-4">End Date</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
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
                <div className="flex gap-2">
                  {session.status !== "active" && (
                    <button onClick={() => onSetActive(session.id)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-yellow-500 hover:text-yellow-600" title="Set as active">
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onView(session)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(session)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(session.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
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

export default SessionTable;
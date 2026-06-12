// src/renderer/pages/notification-logs/components/NotificationLogTable.tsx
import React from "react";
import { Eye, Trash2, RotateCw, Send } from "lucide-react";
import type { NotificationLogEntry } from "../../../api/core/notificationLog";

interface NotificationLogTableProps {
  logs: NotificationLogEntry[];
  onView: (log: NotificationLogEntry) => void;
  onRetry: (id: number) => void;
  onResend: (id: number) => void;
  onDelete: (id: number) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  sent: { bg: "#d1fae5", text: "#065f46" },
  failed: { bg: "#fee2e2", text: "#991b1b" },
  queued: { bg: "#fef3c7", text: "#92400e" },
  resend: { bg: "#dbeafe", text: "#1e40af" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusColors[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {status}
    </span>
  );
};

const NotificationLogTable: React.FC<NotificationLogTableProps> = ({
  logs,
  onView,
  onRetry,
  onResend,
  onDelete,
}) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No notification logs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Recipient</th>
            <th className="text-left py-3 px-4">Subject</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Sent At</th>
            <th className="text-right py-3 px-4">Retry</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4">{log.recipient_email}</td>
              <td className="py-2.5 px-4 max-w-md truncate">{log.subject || "—"}</td>
              <td className="py-2.5 px-4"><StatusBadge status={log.status} /></td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {log.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}
              </td>
              <td className="py-2.5 px-4 text-right text-xs text-[var(--text-tertiary)]">
                {log.retry_count}
              </td>
              <td className="py-2.5 px-4">
                <div className="flex gap-2">
                  <button onClick={() => onView(log)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  {log.status === "failed" && (
                    <button onClick={() => onRetry(log.id)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-green)]" title="Retry">
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onResend(log.id)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-blue)]" title="Resend">
                    <Send className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(log.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
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

export default NotificationLogTable;
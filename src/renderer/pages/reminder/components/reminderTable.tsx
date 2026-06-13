// src/renderer/pages/system/reminderLog/components/reminderTable.tsx
import React from "react";
import { Eye, RefreshCw, Send, Trash2, Clock, CheckCircle, XCircle, RotateCw, Mail, Loader2 } from "lucide-react";
import type { NotificationLogEntry } from "../../../api/core/reminder_log";
import { formatDate } from "../../../utils/formatters";


interface NotificationTableProps {
  logs: NotificationLogEntry[];
  onView: (log: NotificationLogEntry) => void;
  onRetry: (id: number) => void;
  onResend: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  sendingIds?: Set<number>;
}

const getStatusBadgeStyle = (status: string): React.CSSProperties => {
  switch (status) {
    case "sent":
      return { backgroundColor: "rgba(76, 175, 80, 0.2)", color: "var(--success-color)", borderColor: "rgba(76, 175, 80, 0.3)" };
    case "queued":
      return { backgroundColor: "rgba(255, 179, 0, 0.2)", color: "var(--warning-color)", borderColor: "rgba(255, 179, 0, 0.3)" };
    case "failed":
      return { backgroundColor: "rgba(229, 57, 53, 0.2)", color: "var(--danger-color)", borderColor: "rgba(229, 57, 53, 0.3)" };
    case "resend":
      return { backgroundColor: "rgba(33, 150, 243, 0.2)", color: "var(--accent-blue)", borderColor: "rgba(33, 150, 243, 0.3)" };
    default:
      return { backgroundColor: "rgba(100, 100, 100, 0.2)", color: "var(--text-tertiary)", borderColor: "rgba(100, 100, 100, 0.3)" };
  }
};

export const NotificationTable: React.FC<NotificationTableProps> = ({
  logs,
  onView,
  onRetry,
  onResend,
  onDelete,
  isLoading,
  sendingIds = new Set(),
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (logs?.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]/20">
        <Mail className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
        <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">No email records found</h3>
        <p className="text-[var(--text-secondary)]">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]/20">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]/20">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Recipient</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Subject</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Retries/Resends</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Sent At</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]/10">
          {logs?.map((log) => {
            const isSending = sendingIds.has(log.id);
            return (
              <tr
                key={log.id}
                onClick={() => onView(log)}
                className="hover:bg-[var(--card-hover-bg)]/20 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-[var(--text-primary)] whitespace-nowrap">#{log.id}</td>
                <td className="px-4 py-3 text-[var(--text-primary)] whitespace-nowrap">{log.recipient_email}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">{log.subject || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 border" style={getStatusBadgeStyle(log.status)}>
                    {log.status === "resend" && <RotateCw className="w-3 h-3" />}
                    {log.status === "sent" && <CheckCircle className="w-3 h-3" />}
                    {log.status === "queued" && <Clock className="w-3 h-3" />}
                    {log.status === "failed" && <XCircle className="w-3 h-3" />}
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                  {log.retry_count} / {log.resend_count}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                  {log.sent_at ? formatDate(log.sent_at) : "—"}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(log.created_at)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(log); }}
                      disabled={isSending}
                      className="p-1.5 rounded-md hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {log.status === "failed" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRetry(log.id); }}
                        disabled={isSending}
                        className="p-1.5 rounded-md hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Retry failed email"
                      >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                    )}
                    {(log.status === "sent" || log.status === "resend") && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onResend(log.id); }}
                        disabled={isSending}
                        className="p-1.5 rounded-md hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Resend email"
                      >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
                      disabled={isSending}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
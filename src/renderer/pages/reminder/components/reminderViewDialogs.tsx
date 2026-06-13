// src/renderer/pages/system/reminderLog/components/reminderViewDialogs.tsx
import React from "react";
import { Mail, AlertCircle, User, FileText } from "lucide-react";
import type { NotificationLogEntry } from "../../../api/core/reminder_log";
import Modal from "../../../components/UI/Modal";
import { formatDate } from "../../../utils/formatters";
import Button from "../../../components/UI/Button";


interface NotificationViewDialogProps {
  log: NotificationLogEntry;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationViewDialog: React.FC<NotificationViewDialogProps> = ({ log, isOpen, onClose }) => {
  const statusColorMap: Record<string, string> = {
    queued: "var(--warning-color)",
    sent: "var(--success-color)",
    failed: "var(--danger-color)",
    resend: "var(--accent-blue)",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Email Reminder Details" size="lg">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium border"
            style={{ color: statusColorMap[log.status] || "var(--text-tertiary)", borderColor: `${statusColorMap[log.status]}40`, backgroundColor: `${statusColorMap[log.status]}10` }}
          >
            {log.status.toUpperCase()}
          </span>
          <span className="text-sm text-[var(--text-tertiary)]">ID: #{log.id}</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Recipient</p>
              <p className="text-[var(--text-primary)] font-medium">{log.recipient_email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Subject</p>
              <p className="text-[var(--text-primary)] font-medium">{log.subject || "(No subject)"}</p>
            </div>
          </div>

          {log.payload && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[var(--text-tertiary)] uppercase">Message Content</p>
                <pre className="mt-1 p-3 bg-[var(--card-secondary-bg)] rounded-lg text-xs text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap">
                  {log.payload}
                </pre>
              </div>
            </div>
          )}

          {log.error_message && (
            <div className="flex items-start gap-3 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div>
                <p className="text-xs text-red-400 uppercase">Error</p>
                <p className="text-sm text-red-300">{log.error_message}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--border-color)]/10">
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Created</p>
              <p className="text-sm text-[var(--text-primary)]">{formatDate(log.created_at)}</p>
            </div>
            {log.sent_at && (
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase">Sent</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(log.sent_at)}</p>
              </div>
            )}
            {log.last_error_at && (
              <div>
                <p className="text-xs text-[var(--text-tertiary)] uppercase">Last Error</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(log.last_error_at)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Retry Count</p>
              <p className="text-sm text-[var(--text-primary)]">{log.retry_count}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Resend Count</p>
              <p className="text-sm text-[var(--text-primary)]">{log.resend_count}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-tertiary)] uppercase">Updated</p>
              <p className="text-sm text-[var(--text-primary)]">{formatDate(log.updated_at)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};
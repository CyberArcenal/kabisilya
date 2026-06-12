// src/renderer/pages/notification-logs/components/ViewLogModal.tsx
import React from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import { Copy } from "lucide-react";
import type { NotificationLogEntry } from "../../../api/core/notificationLog";
import { showSuccess } from "../../../utils/notification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  log: NotificationLogEntry | null;
}

const ViewLogModal: React.FC<Props> = ({ isOpen, onClose, log }) => {
  if (!log) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copied to clipboard");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Log Details" size="lg">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">ID</label>
            <p>{log.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{log.status}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Recipient</label>
            <p>{log.recipient_email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Subject</label>
            <p>{log.subject || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Sent At</label>
            <p>{formatDate(log.sent_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Last Error At</label>
            <p>{formatDate(log.last_error_at)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Retry Count</label>
            <p>{log.retry_count}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Resend Count</label>
            <p>{log.resend_count}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Error Message</label>
            <p className="text-red-500">{log.error_message || "—"}</p>
          </div>
          <div className="col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Payload (Email Body)</label>
              <button
                onClick={() => copyToClipboard(log.payload || "")}
                className="p-1 rounded hover:bg-[var(--card-hover-bg)]"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <pre className="text-xs bg-[var(--input-bg)] p-3 rounded overflow-auto max-h-64 border border-[var(--border-color)] whitespace-pre-wrap">
              {log.payload || "—"}
            </pre>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewLogModal;
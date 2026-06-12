// src/renderer/pages/notification-logs/components/NotificationLogFilters.tsx
import React from "react";
import { Filter, X } from "lucide-react";
import type { NotificationLogFilters as NotificationLogFiltersType } from "../types";

interface Props {
  filters: NotificationLogFiltersType;
  onFilterChange: (filters: Partial<NotificationLogFiltersType>) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "queued", label: "Queued" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "resend", label: "Resend" },
];

const NotificationLogFilters: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const hasFilters = !!(
    filters.status ||
    filters.recipient_email ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Recipient email"
          value={filters.recipient_email || ""}
          onChange={(e) => onFilterChange({ recipient_email: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
        <input
          type="date"
          placeholder="Start date"
          value={filters.startDate || ""}
          onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
        <input
          type="date"
          placeholder="End date"
          value={filters.endDate || ""}
          onChange={(e) => onFilterChange({ endDate: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
      </div>
      {hasFilters && (
        <div className="flex justify-end">
          <button onClick={onReset} className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationLogFilters;
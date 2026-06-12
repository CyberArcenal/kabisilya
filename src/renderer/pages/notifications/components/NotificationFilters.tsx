import React from "react";
import { Filter, X } from "lucide-react";
import type { NotificationFilters } from "../types";

interface Props {
  filters: NotificationFilters;
  onFilterChange: (filters: Partial<NotificationFilters>) => void;
  onReset: () => void;
}

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

const NotificationFiltersComponent: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const hasFilters = filters.isRead !== undefined || filters.type;

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={filters.isRead === undefined ? "" : filters.isRead ? "read" : "unread"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") onFilterChange({ isRead: undefined });
            else onFilterChange({ isRead: val === "read" });
          }}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          <option value="">All Status</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>
        <select
          value={filters.type || ""}
          onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
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

export default NotificationFiltersComponent;
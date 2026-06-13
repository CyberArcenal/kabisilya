// src/renderer/pages/farms/bukid/components/BukidFilters.tsx
import React from "react";
import { Search, Filter, X } from "lucide-react";
import type { BukidFilters } from "../types";

interface Props {
  filters: BukidFilters;
  onFilterChange: (filters: Partial<BukidFilters>) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const BukidFilters: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const hasFilters = !!filters.search || !!filters.status;

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--text-primary)",
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
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

export default BukidFilters;
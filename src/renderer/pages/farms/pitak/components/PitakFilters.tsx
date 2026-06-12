// src/renderer/pages/farms/pitak/components/PitakFilters.tsx
import React from "react";
import { Filter, X } from "lucide-react";
import BukidSelect from "../../../../components/Selects/BukidSelect";

interface Props {
  search: string;
  bukidId?: number;
  status: string;
  onSearchChange: (val: string) => void;
  onBukidChange: (val: number | undefined) => void;
  onStatusChange: (val: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PitakFilters: React.FC<Props> = ({
  search,
  bukidId,
  status,
  onSearchChange,
  onBukidChange,
  onStatusChange,
  onReset,
}) => {
  const hasFilters = !!(search || bukidId || status);

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Search by location..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--input-border)",
            color: "var(--text-primary)",
          }}
        />
        <BukidSelect
          value={bukidId || null}
          onChange={(id) => onBukidChange(id || undefined)}
          placeholder="All farms"
        />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
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

export default PitakFilters;
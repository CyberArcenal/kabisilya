// src/renderer/pages/audit/components/AuditFilters.tsx
import React from "react";
import { Filter, Search, X } from "lucide-react";
import type { AuditFilters as AuditFiltersType } from "../types";

interface Props {
  filters: AuditFiltersType;
  onFilterChange: (filters: Partial<AuditFiltersType>) => void;
  onReset: () => void;
  distinctEntities: string[];
  distinctActions: string[];
  distinctUsers: string[];
}

const AuditFilters: React.FC<Props> = ({
  filters,
  onFilterChange,
  onReset,
  distinctEntities,
  distinctActions,
  distinctUsers,
}) => {
  const hasFilters = !!(
    filters.search ||
    filters.entity ||
    filters.action ||
    filters.user ||
    filters.startDate ||
    filters.endDate
  );

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Filter className="w-4 h-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search description, entity, action..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Entity filter */}
        <select
          value={filters.entity}
          onChange={(e) => onFilterChange({ entity: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          <option value="">All Entities</option>
          {distinctEntities.map((entity) => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </select>

        {/* Action filter */}
        <select
          value={filters.action}
          onChange={(e) => onFilterChange({ action: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          <option value="">All Actions</option>
          {distinctActions.map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>

        {/* User filter */}
        <select
          value={filters.user}
          onChange={(e) => onFilterChange({ user: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        >
          <option value="">All Users</option>
          {distinctUsers.map((user) => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          placeholder="Start date"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
        <input
          type="date"
          placeholder="End date"
          value={filters.endDate}
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

export default AuditFilters;
// src/renderer/pages/farms/bukid/components/BukidTable.tsx
import React, { useState } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { BukidWithPitaks } from "../hooks/useBukids";
import BukidActionsDropdown from "./BukidActionsDropdown";
import type { Pitak } from "../../../../api/core/pitak";

interface BukidTableProps {
  bukids: BukidWithPitaks[];
  onView: (bukid: BukidWithPitaks) => void;
  onEdit: (bukid: BukidWithPitaks) => void;
  onDelete: (id: number) => void;
  onPitakClick?: (pitakId: number) => void;
  onChangeStatus: (bukid: BukidWithPitaks) => void;
  onViewPlots?: (bukidId: number) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  selectedIds?: number[];
  onSelectRow?: (id: number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  onAddPlot?: (bukid: BukidWithPitaks) => void;
}

const getStatusBadge = (status: string) => {
  const base = "px-2 py-1 text-xs rounded-full font-medium";
  switch (status) {
    case "active":
      return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
    case "initiated":
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
    case "completed":
      return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
    case "cancelled":
      return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
    default:
      return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  }
};

const PlotStack: React.FC<{
  pitaks: any[];
  bukidId: number;
  onPitakClick?: (pitakId: number) => void;
  onViewPlots?: (bukidId: number) => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}> = ({ pitaks, bukidId, onPitakClick, onViewPlots, onToggleExpand, isExpanded }) => {
  const maxDisplay = 3;
  const displayed = pitaks.slice(0, maxDisplay);
  const remaining = pitaks.length - maxDisplay;

  const handleViewAll = () => {
    if (onViewPlots) onViewPlots(bukidId);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center -space-x-2">
        {displayed.map((pitak) => (
          <button
            key={pitak.id}
            onClick={() => onPitakClick?.(pitak.id)}
            className="w-8 h-8 rounded-full bg-[var(--card-secondary-bg)] border-2 border-white dark:border-gray-800 flex items-center justify-center hover:scale-110 transition-transform"
            title={pitak.location || `Plot #${pitak.id}`}
          >
            <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
          </button>
        ))}
        {remaining > 0 && (
          <button
            onClick={handleViewAll}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={`View all ${pitaks.length} plots`}
          >
            +{remaining}
          </button>
        )}
      </div>
      {pitaks.length > 0 && (
        <button
          onClick={onToggleExpand}
          className="p-1 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
          title={isExpanded ? "Hide plots" : "Show plots"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
      )}
    </div>
  );
};

// Helper to calculate completion percentage
const getCompletionPercent = (pitaks: Pitak[] | undefined) => {
  if (!pitaks || pitaks.length === 0) return 0;
  const completed = pitaks.filter((p) => p.status === "completed").length;
  return Math.round((completed / pitaks.length) * 100);
};

const BukidTable: React.FC<BukidTableProps> = ({
  bukids,
  onView,
  onEdit,
  onDelete,
  onPitakClick,
  onChangeStatus,
  onViewPlots,
  onSort,
  sortBy,
  sortOrder,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onAddPlot,
}) => {
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  if (bukids.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No farms found
      </div>
    );
  }

  const allSelected = bukids.length > 0 && bukids.every((b) => selectedIds.includes(b.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-3 px-4 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("name")}
            >
              Name {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("location")}
            >
              Location {sortBy === "location" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("area")}
            >
              Total Luwang {sortBy === "area" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("status")}
            >
              Status {sortBy === "status" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Completion
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("session.name")}
            >
              Session {sortBy === "session.name" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Plots
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bukids.map((bukid) => {
            const isExpanded = expandedRowId === bukid.id;
            const totalPitaks = bukid.pitaks?.length || 0;
            const completionPercent = totalPitaks > 0 ? getCompletionPercent(bukid.pitaks) : 0;
            return (
              <React.Fragment key={bukid.id}>
                <tr className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
                  <td className="py-2.5 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(bukid.id)}
                      onChange={(e) => onSelectRow?.(bukid.id, e.target.checked)}
                      className="rounded border-[var(--border-color)] cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                    {bukid.name}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                    {bukid.location || "—"}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                    {bukid.area?.toFixed(2) ?? "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={getStatusBadge(bukid.status)}>
                      {bukid.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 min-w-[100px]">
                    {totalPitaks === 0 ? (
                      <span className="text-xs text-[var(--text-tertiary)]">No plots</span>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[var(--text-secondary)]">{completionPercent}%</span>
                          <span className="text-[var(--text-tertiary)]">
                            {bukid.pitaks?.filter((p) => p.status === "completed").length}/{totalPitaks}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                    {bukid.session?.name || "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    <PlotStack
                      pitaks={bukid.pitaks || []}
                      bukidId={bukid.id}
                      onPitakClick={onPitakClick}
                      onViewPlots={onViewPlots}
                      onToggleExpand={() => toggleExpand(bukid.id)}
                      isExpanded={isExpanded}
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <BukidActionsDropdown
                      bukid={bukid}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onChangeStatus={onChangeStatus}
                      onAddPlot={onAddPlot}
                    />
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="bg-[var(--card-secondary-bg)]/50">
                    <td colSpan={9} className="p-0">
                      <div className="p-4 border-t border-[var(--border-color)]">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
                            Plots under {bukid.name}
                          </h4>
                          <button
                            onClick={() => onViewPlots?.(bukid.id)}
                            className="text-xs text-[var(--primary-color)] hover:underline"
                          >
                            View all →
                          </button>
                        </div>
                        {(!bukid.pitaks || bukid.pitaks.length === 0) ? (
                          <p className="text-sm text-[var(--text-tertiary)] py-2">No plots yet</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--card-secondary-bg)]">
                                <tr>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Location</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Area (luwang)</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Status</th>
                                  <th className="text-left py-2 px-3 text-[var(--text-secondary)]">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bukid.pitaks.map((pitak) => (
                                  <tr key={pitak.id} className="border-t border-[var(--border-color)]">
                                    <td className="py-2 px-3">{pitak.location || `Plot #${pitak.id}`}</td>
                                    <td className="py-2 px-3">{pitak.totalLuwang ?? "—"}</td>
                                    <td className="py-2 px-3">
                                      <span className={getStatusBadge(pitak.status)}>{pitak.status}</span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <button
                                        onClick={() => onPitakClick?.(pitak.id)}
                                        className="text-xs text-[var(--primary-color)] hover:underline"
                                      >
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BukidTable;
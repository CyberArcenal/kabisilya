import React from "react";
import { Eye, CreditCard, Trash2, DollarSign } from "lucide-react";
import type { WorkerDebtSummary } from "../utils/aggregateDebts";
import type { Debt } from "../../../../api/core/debt";

interface Props {
  workers: WorkerDebtSummary[];
  onViewWorker: (worker: WorkerDebtSummary) => void;
  onRecordPayment: (debt: Debt, workerName: string) => void;
  onPayAllDebts: (worker: WorkerDebtSummary) => void;
  onDeleteWorker: (workerId: number) => void;
  selectedIds: number[];
  onSelectRow: (workerId: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  sortBy: string;
  sortOrder: "ASC" | "DESC";
  onSort: (field: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const SortIcon = ({
  active,
  order,
}: {
  active: boolean;
  order: "ASC" | "DESC";
}) => {
  if (!active) return <span className="ml-1 opacity-30">↕️</span>;
  return <span className="ml-1">{order === "ASC" ? "↑" : "↓"}</span>;
};

const statusColors: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  partially_paid:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  overdue:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  settled:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const StatusBadge: React.FC<{ status: string; count: number }> = ({
  status,
  count,
}) => {
  if (count === 0) return null;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}: {count}
    </span>
  );
};

export const WorkerDebtSummaryTable: React.FC<Props> = ({
  workers,
  onViewWorker,
  onDeleteWorker,
  onPayAllDebts,
  selectedIds,
  onSelectRow,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const allSelected =
    workers.length > 0 &&
    workers.every((w) => selectedIds.includes(w.workerId));
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (workers.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-3 px-3 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => input && (input.indeterminate = someSelected)}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded cursor-pointer"
              />
            </th>
            {[
              { key: "workerName", label: "Worker" },
              { key: "debtCount", label: "# Debts" },
              { key: "totalAmount", label: "Total Amount" },
              { key: "activeBalance", label: "Active Balance" }, // ← palitan ang key
            ].map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                onClick={() => onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  <SortIcon active={sortBy === col.key} order={sortOrder} />
                </div>
              </th>
            ))}
            <th className="text-left py-3 px-3 font-semibold text-[var(--text-secondary)]">
              Status Breakdown
            </th>
            <th className="text-left py-3 px-3 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker, idx) => (
            <tr
              key={worker.workerId}
              className={`border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors ${
                idx % 2 === 0
                  ? "bg-[var(--card-bg)]"
                  : "bg-[var(--card-secondary-bg)]/50"
              }`}
            >
              <td className="py-2 px-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worker.workerId)}
                  onChange={(e) =>
                    onSelectRow(worker.workerId, e.target.checked)
                  }
                  className="rounded cursor-pointer"
                />
              </td>
              <td className="py-2 px-3 font-medium text-[var(--text-primary)]">
                {worker.workerName}
              </td>
              <td className="py-2 px-3 text-[var(--text-secondary)]">
                {worker.debtCount}
              </td>
              <td className="py-2 px-3 text-[var(--text-secondary)]">
                {formatCurrency(worker.totalAmount)}
              </td>
              <td className="py-2 px-3 font-bold text-red-500">
                {formatCurrency(worker.activeBalance)} {/* ← gamitin ang activeBalance */}
              </td>
              <td className="py-2 px-3">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(worker.statusBreakdown).map(
                    ([status, count]) => (
                      <StatusBadge key={status} status={status} count={count} />
                    ),
                  )}
                </div>
              </td>
              <td className="py-2 px-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewWorker(worker)}
                    className="p-1.5 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600 transition-colors"
                    title="View all debts"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPayAllDebts(worker)}
                    className="p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
                    title="Pay all debts of this worker"
                    disabled={worker.activeBalance <= 0} // ← gamitin ang activeBalance
                  >
                    <DollarSign className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteWorker(worker.workerId)}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                    title="Delete all debts of this worker"
                  >
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
// components/WorkerPaymentTable.tsx
import React from "react";
import { Eye, CreditCard, Trash2 } from "lucide-react";
import type { WorkerPaymentSummary } from "../utils/aggregatePayments";

interface Props {
  workers: WorkerPaymentSummary[];
  onViewWorker: (worker: WorkerPaymentSummary) => void;
  onRecordPayment: (worker: WorkerPaymentSummary) => void;
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

const SortIcon = ({ active, order }: { active: boolean; order: "ASC" | "DESC" }) => {
  if (!active) return <span className="ml-1 opacity-30">↕️</span>;
  return <span className="ml-1">{order === "ASC" ? "↑" : "↓"}</span>;
};

export const WorkerPaymentTable: React.FC<Props> = ({
  workers,
  onViewWorker,
  onRecordPayment,
  onDeleteWorker,
  selectedIds,
  onSelectRow,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const allSelected = workers.length > 0 && workers.every((w) => selectedIds.includes(w.workerId));
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (workers.length === 0) return null; // handled by parent

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
              { key: "totalOutstandingPayments", label: "Pending ₱" },
              { key: "totalDebtBalance", label: "Debt ₱" },
              { key: "totalGross", label: "Gross ₱" },
              { key: "totalDebtDeduction", label: "Debt Deducted ₱" },
              { key: "totalNet", label: "Net ₱" },
              { key: "totalPaid", label: "Paid ₱" },
              { key: "paymentCount", label: "# Payments" },
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
            <th className="text-left py-3 px-3 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker, idx) => (
            <tr
              key={worker.workerId}
              className={`border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors ${
                idx % 2 === 0 ? "bg-[var(--card-bg)]" : "bg-[var(--card-secondary-bg)]/50"
              }`}
            >
              <td className="py-2 px-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worker.workerId)}
                  onChange={(e) => onSelectRow(worker.workerId, e.target.checked)}
                  className="rounded cursor-pointer"
                />
              </td>
              <td className="py-2 px-3 font-medium text-[var(--text-primary)]">{worker.workerName}</td>
              <td className="py-2 px-3 text-amber-600 font-medium">{formatCurrency(worker.totalOutstandingPayments)}</td>
              <td className="py-2 px-3 text-red-500 font-medium">{formatCurrency(worker.totalDebtBalance)}</td>
              <td className="py-2 px-3 text-[var(--text-secondary)]">{formatCurrency(worker.totalGross)}</td>
              <td className="py-2 px-3 text-red-500">{formatCurrency(worker.totalDebtDeduction)}</td>
              <td className="py-2 px-3 font-bold text-emerald-600">{formatCurrency(worker.totalNet)}</td>
              <td className="py-2 px-3 text-[var(--text-secondary)]">{formatCurrency(worker.totalPaid)}</td>
              <td className="py-2 px-3 text-center">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs text-white">
                  {worker.paymentCount}
                </span>
              </td>
              <td className="py-2 px-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewWorker(worker)}
                    className="p-1.5 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600 transition-colors"
                    title="View all payments"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRecordPayment(worker)}
                    className="p-1.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
                    title="Record payment for this worker"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteWorker(worker.workerId)}
                    className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                    title="Delete all payments of this worker"
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
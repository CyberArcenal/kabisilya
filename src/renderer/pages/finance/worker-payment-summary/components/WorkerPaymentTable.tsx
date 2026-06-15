// src/renderer/pages/finance/worker-payment-summary/components/WorkerPaymentTable.tsx
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
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount,
  );

const SortIndicator = ({
  field,
  currentSortBy,
  sortOrder,
}: {
  field: string;
  currentSortBy: string;
  sortOrder: string;
}) => {
  if (currentSortBy !== field) return null;
  return <span className="ml-1">{sortOrder === "ASC" ? "↑" : "↓"}</span>;
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
  const allSelected =
    workers.length > 0 &&
    workers.every((w) => selectedIds.includes(w.workerId));
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (workers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No workers found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-2 px-3 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("workerName")}
            >
              Worker{" "}
              <SortIndicator
                field="workerName"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalOutstandingPayments")}
            >
              Pending Payments{" "}
              <SortIndicator
                field="totalOutstandingPayments"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalDebtBalance")}
            >
              Outstanding Debt{" "}
              <SortIndicator
                field="totalDebtBalance"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalGross")}
            >
              Total Gross{" "}
              <SortIndicator
                field="totalGross"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalDebtDeduction")}
            >
              Debt Deduction{" "}
              <SortIndicator
                field="totalDebtDeduction"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalNet")}
            >
              Total Net{" "}
              <SortIndicator
                field="totalNet"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("totalPaid")}
            >
              Total Paid{" "}
              <SortIndicator
                field="totalPaid"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th
              className="text-center py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("paymentCount")}
            >
              # Payments{" "}
              <SortIndicator
                field="paymentCount"
                currentSortBy={sortBy}
                sortOrder={sortOrder}
              />
            </th>
            <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr
              key={worker.workerId}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <td className="py-1.5 px-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(worker.workerId)}
                  onChange={(e) =>
                    onSelectRow(worker.workerId, e.target.checked)
                  }
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-1.5 px-3 font-medium text-[var(--text-primary)]">
                {worker.workerName}
              </td>
              <td className="py-1.5 px-3 text-right text-amber-600">
                {formatCurrency(worker.totalOutstandingPayments)}
              </td>
              <td className="py-1.5 px-3 text-right text-red-500">
                {formatCurrency(worker.totalDebtBalance)}
              </td>
              <td className="py-1.5 px-3 text-right text-[var(--text-secondary)]">
                {formatCurrency(worker.totalGross)}
              </td>
              <td className="py-1.5 px-3 text-right text-red-500">
                {formatCurrency(worker.totalDebtDeduction)}
              </td>
              <td className="py-1.5 px-3 text-right font-bold text-emerald-600">
                {formatCurrency(worker.totalNet)}
              </td>
              <td className="py-1.5 px-3 text-right text-[var(--text-secondary)]">
                {formatCurrency(worker.totalPaid)}
              </td>
              <td className="py-1.5 px-3 text-center">{worker.paymentCount}</td>
              <td className="py-1.5 px-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewWorker(worker)}
                    className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-sky-500"
                    title="View payments"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRecordPayment(worker)}
                    className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-emerald-500"
                    title="Record payment"
                  >
                    <CreditCard className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteWorker(worker.workerId)}
                    className="p-1.5 rounded hover:bg-[var(--card-hover-bg)] text-red-500"
                    title="Delete all payments"
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

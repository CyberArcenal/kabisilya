// src/renderer/pages/finance/debts/components/DebtTable.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import type { DebtWithDetails } from "../types";
import DebtActionsDropdown from "./DebtActionsDropdown";

interface DebtTableProps {
  debts: DebtWithDetails[];
  onView: (debt: DebtWithDetails) => void;
  onDelete: (id: number) => void;
  onRecordPayment: (debt: DebtWithDetails) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  selectedIds?: number[];
  onSelectRow?: (id: number, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  onCancel?: (debt: DebtWithDetails) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount,
  );

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  partially_paid: { bg: "#dbeafe", text: "#1e40af" },
  paid: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
  overdue: { bg: "#fee2e2", text: "#dc2626" },
  settled: { bg: "#e0e7ff", text: "#3730a3" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusColors[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span
      className="px-2 py-1 text-xs rounded-full"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
};

const getProgressPercent = (balance: number, originalAmount: number) => {
  if (!originalAmount || originalAmount <= 0) return 0;
  const paid = originalAmount - balance;
  let percent = (paid / originalAmount) * 100;
  // Clamp between 0 and 100
  return Math.min(100, Math.max(0, percent));
};

const DebtTable: React.FC<DebtTableProps> = ({
  debts,
  sortOrder,
  sortBy,
  onSort,
  onView,
  onDelete,
  onRecordPayment,
  selectedIds = [],
  onSelectRow,
  onCancel,
  onSelectAll,
}) => {
  if (debts.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No debts found
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allSelected =
    debts.length > 0 && debts.every((d) => selectedIds.includes(d.id));
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
              onClick={() => onSort?.("workerName")}
            >
              Worker{" "}
              {sortBy === "workerName" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("amount")}
            >
              Amount {sortBy === "amount" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("balance")}
            >
              Balance{" "}
              {sortBy === "balance" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("dueDate")}
            >
              Due Date{" "}
              {sortBy === "dueDate" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("status")}
            >
              Status {sortBy === "status" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th
              className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("interestRate")}
            >
              Interest Rate{" "}
              {sortBy === "interestRate" && (sortOrder === "ASC" ? "↑" : "↓")}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => {
            const dueDate = debt.dueDate ? new Date(debt.dueDate) : null;
            const isOverdue =
              dueDate &&
              dueDate < today &&
              debt.balance > 0 &&
              debt.status !== "paid" &&
              debt.status !== "cancelled" &&
              debt.status !== "settled";
            const progress = getProgressPercent(debt.balance, debt.amount);
            return (
              <tr
                key={debt.id}
                className={`border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors ${
                  isOverdue ? "bg-red-50 dark:bg-red-950/20" : ""
                }`}
              >
                <td className="py-2.5 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(debt.id)}
                    onChange={(e) => onSelectRow?.(debt.id, e.target.checked)}
                    className="rounded border-[var(--border-color)] cursor-pointer"
                  />
                </td>
                <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                  {debt.worker?.name || "—"}
                  {isOverdue && (
                    <AlertCircle className="inline ml-2 w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                  {formatCurrency(debt.amount)}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex flex-col">
                    <span className="text-right text-[var(--text-secondary)]">
                      {formatCurrency(debt.balance)}
                    </span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((debt.amount - debt.balance) / debt.amount) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                  {dueDate ? dueDate.toLocaleDateString() : "—"}
                </td>
                <td className="py-2.5 px-4">
                  <StatusBadge status={debt.status} />
                </td>
                <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                  {debt.interestRate}%
                </td>
                <td className="py-2.5 px-4">
                  <DebtActionsDropdown
                    debt={debt}
                    onView={onView}
                    onRecordPayment={onRecordPayment}
                    onCancel={(debt) => onCancel?.(debt)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DebtTable;

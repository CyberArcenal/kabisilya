// src/renderer/pages/finance/worker-payments/components/PaymentTable.tsx
import React from "react";
import { Calendar } from "lucide-react";
import type { PaymentWithDetails } from "../types";
import PaymentActionsDropdown from "./PaymentActionsDropdown";

interface PaymentTableProps {
  payments: PaymentWithDetails[];
  onView: (payment: PaymentWithDetails) => void;
  onEdit?: (payment: PaymentWithDetails) => void;
  onDelete: (id: number) => void;
  onChangeStatus?: (payment: PaymentWithDetails) => void;
  onRecordPayment: (payment: PaymentWithDetails) => void;
  onCancelPayment: (payment: PaymentWithDetails) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // Selection props
  selectedIds: number[];
  onSelectRow: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount,
  );

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  partially_paid: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
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

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
  onCancelPayment,
  onRecordPayment,
  onSort,
  sortBy,
  sortOrder,
  selectedIds,
  onSelectRow,
  onSelectAll,
}) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No payments found
      </div>
    );
  }

  const allSelected =
    payments.length > 0 && payments.every((p) => selectedIds.includes(p.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return <span className="ml-1">{sortOrder === "ASC" ? "↑" : "↓"}</span>;
  };

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
              onClick={() => onSort?.("worker.name")}
            >
              Worker {renderSortIndicator("worker.name")}
            </th>
            <th
              className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("pitak.location")}
            >
              Pitak {renderSortIndicator("pitak.location")}
            </th>
            <th
              className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("session.name")}
            >
              Session {renderSortIndicator("session.name")}
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("grossPay")}
            >
              Gross {renderSortIndicator("grossPay")}
            </th>
            <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">
              Deduct
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("amountPaid")}
            >
              Paid {renderSortIndicator("amountPaid")}
            </th>
            <th
              className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("netPay")}
            >
              Net {renderSortIndicator("netPay")}
            </th>
            <th
              className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("paymentDate")}
            >
              Pay Date {renderSortIndicator("paymentDate")}
            </th>
            <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">
              Last Pay
            </th>
            <th
              className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort?.("status")}
            >
              Status {renderSortIndicator("status")}
            </th>
            <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <td className="py-1.5 px-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(payment.id)}
                  onChange={(e) => onSelectRow(payment.id, e.target.checked)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-1.5 px-3 font-medium text-[var(--text-primary)]">
                {payment.worker?.name || "—"}
              </td>
              <td className="py-1.5 px-3 text-[var(--text-secondary)]">
                {payment.pitak?.location || "—"}
              </td>
              <td className="py-1.5 px-3 text-[var(--text-secondary)]">
                {payment.session?.name || "—"}
              </td>
              <td className="py-1.5 px-3 text-right text-[var(--text-secondary)] text-xs">
                {formatCurrency(payment.grossPay)}
              </td>
              <td className="py-1.5 px-3 text-right text-[var(--text-secondary)] text-xs">
                {formatCurrency(
                  (payment.manualDeduction || 0) +
                    (payment.debtDeductionTotal || 0),
                )}
                {payment.totalDebtDeduction > 0 && (
                  <span
                    className="ml-1 text-[10px] text-red-500"
                    title="Debt deduction"
                  >
                    (debt)
                  </span>
                )}
              </td>
              <td className="py-1.5 px-3 text-right text-[var(--text-secondary)] text-xs">
                {formatCurrency(payment.amountPaid || 0)}
              </td>
              <td className="py-1.5 px-3 text-right font-medium text-[var(--accent-green)] text-xs">
                {formatCurrency(payment.netPay)}
              </td>
              <td className="py-1.5 px-3 text-[var(--text-secondary)] text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString()
                    : "—"}
                </div>
              </td>
              <td className="py-1.5 px-3 text-[var(--text-secondary)] text-xs">
                {payment.lastPaymentDate
                  ? new Date(payment.lastPaymentDate).toLocaleDateString()
                  : "—"}
              </td>
              <td className="py-1.5 px-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="py-1.5 px-3">
                <PaymentActionsDropdown
                  payment={payment}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                  onRecordPayment={onRecordPayment}
                  onCancelPayment={onCancelPayment}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;

// src/renderer/pages/finance/worker-payments/components/PaymentTable.tsx
import React from "react";
import { Calendar } from "lucide-react";
import type { PaymentWithDetails } from "../types";
import PaymentActionsDropdown from "./PaymentActionsDropdown";

interface PaymentTableProps {
  payments: PaymentWithDetails[];
  onView: (payment: PaymentWithDetails) => void;
  onEdit: (payment: PaymentWithDetails) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (payment: PaymentWithDetails) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  partially_paid: { bg: "#dbeafe", text: "#1e40af" },
  completed: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = statusColors[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
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
}) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No payments found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Worker</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Pitak</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Session</th>
            <th className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)]">Gross Pay</th>
            <th className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)]">Net Pay</th>
            <th className="text-right py-3 px-4 font-semibold text-[var(--text-secondary)]">Deductions</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Payment Date</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">
                {payment.worker?.name || "—"}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {payment.pitak?.location || "—"}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {payment.session?.name || "—"}
              </td>
              <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                {formatCurrency(payment.grossPay)}
              </td>
              <td className="py-2.5 px-4 text-right font-medium text-[var(--accent-green)]">
                {formatCurrency(payment.netPay)}
              </td>
              <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                {formatCurrency((payment.manualDeduction || 0) + (payment.totalDebtDeduction || 0))}
                {payment.totalDebtDeduction > 0 && (
                  <span className="ml-1 text-xs text-red-500" title="Debt deduction">(debt)</span>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}
                </div>
              </td>
              <td className="py-2.5 px-4">
                <StatusBadge status={payment.status} />
              </td>
              <td className="py-2.5 px-4">
                <PaymentActionsDropdown
                  payment={payment}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
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
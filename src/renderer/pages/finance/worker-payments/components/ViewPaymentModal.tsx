// src/renderer/pages/finance/worker-payments/components/ViewPaymentModal.tsx
import React from "react";
import type { PaymentWithDetails } from "../types";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentWithDetails | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const ViewPaymentModal: React.FC<Props> = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const totalDeductions = (payment.manualDeduction || 0) + (payment.totalDebtDeduction || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Worker</label>
            <p className="text-[var(--text-primary)] font-medium">{payment.worker?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Plot</label>
            <p>{payment.pitak?.location || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Session</label>
            <p>{payment.session?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Assignment</label>
            <p>{payment.assignment ? `#${payment.assignment.id}` : "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Gross Pay</label>
            <p className="text-[var(--text-primary)]">{formatCurrency(payment.grossPay)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Deductions</label>
            <div className="space-y-1">
              <p className="text-sm">
                Manual: {formatCurrency(payment.manualDeduction || 0)}
              </p>
              {payment.totalDebtDeduction > 0 && (
                <p className="text-sm text-red-500">
                  Debt: {formatCurrency(payment.totalDebtDeduction)}
                  <span className="ml-1 text-xs">(Linked debts)</span>
                </p>
              )}
              <p className="text-sm font-medium">Total: {formatCurrency(totalDeductions)}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Net Pay</label>
            <p className="text-lg font-bold text-[var(--accent-green)]">{formatCurrency(payment.netPay)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Payment Date</label>
            <p>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{payment.status}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Notes</label>
            <p className="whitespace-pre-wrap">{payment.notes || "—"}</p>
          </div>
        </div>

        {/* Linked debts (if any) */}
        {payment.debtPayments && payment.debtPayments.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Linked Debt Payments</label>
            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--card-secondary-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-left">Debt ID</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.debtPayments.map((debt) => (
                    <tr key={debt.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">#{debt.id}</td>
                      <td className="px-3 py-2">{formatCurrency(debt.amount)}</td>
                      <td className="px-3 py-2 capitalize">{debt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPaymentModal;
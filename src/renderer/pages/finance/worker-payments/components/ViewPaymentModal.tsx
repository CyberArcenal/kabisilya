// src/renderer/pages/finance/worker-payments/components/ViewPaymentModal.tsx
import React, { useState, useEffect } from "react";
import type { PaymentWithDetails } from "../types";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";
import paymentHistoryAPI from "../../../../api/core/payment_history";
import type { PaymentHistory } from "../../../../api/core/payment_history";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentWithDetails | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
};

const ViewPaymentModal: React.FC<Props> = ({ isOpen, onClose, payment }) => {
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch payment history when modal opens
  useEffect(() => {
    if (!isOpen || !payment?.id) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await paymentHistoryAPI.getByPayment(payment.id, { limit: 100 });
        if (res.status) {
          setHistory(res.data.items);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Failed to fetch payment history", error);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [isOpen, payment?.id]);

  if (!payment) return null;

  const totalDeductions = (payment.manualDeduction || 0) + (payment.totalDebtDeduction || 0);

  // Separate history entries for display
  const recordedPayments = history.filter(h => h.actionType === "payment_recorded");
  const statusChanges = history.filter(h => h.actionType !== "payment_recorded" && h.changedField === "status");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Details" size="lg">
      <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
        {/* Basic info */}
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
              <p className="text-sm">Manual: {formatCurrency(payment.manualDeduction || 0)}</p>
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
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Amount Paid</label>
            <p>{formatCurrency(payment.amountPaid || 0)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Last Payment Date</label>
            <p>{payment.lastPaymentDate ? new Date(payment.lastPaymentDate).toLocaleDateString() : "—"}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Notes</label>
            <p className="whitespace-pre-wrap">{payment.notes || "—"}</p>
          </div>
        </div>

        {/* Payment History Timeline */}
        <div>
          <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Payment & Status History</label>
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="small" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-2">No history records found</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto border border-[var(--border-color)] rounded-lg p-3">
              {/* Recorded payments */}
              {recordedPayments.map((record) => (
                <div key={record.id} className="border-l-2 border-emerald-500 pl-3 py-1">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      💰 Payment Recorded
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatDate(record.changeDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-xs">
                    <div>
                      <span className="text-[var(--text-tertiary)]">Amount Paid:</span>
                      <span className="ml-1 font-medium">{formatCurrency(record.newAmount || 0)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)]">Applied to Debt:</span>
                      <span className="ml-1">
                        {record.notes?.match(/applied (\d+(?:\.\d+)?) to debt/)?.[1]
                          ? formatCurrency(parseFloat(record.notes.match(/applied (\d+(?:\.\d+)?) to debt/)?.[1] || "0"))
                          : "₱0.00"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)]">Method:</span>
                      <span className="ml-1">{record.referenceNumber ? `${record.payment?.paymentMethod || "—"} (${record.referenceNumber})` : record.payment?.paymentMethod || "—"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[var(--text-tertiary)]">Notes:</span>
                      <span className="ml-1">{record.notes || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Status changes */}
              {statusChanges.map((change) => (
                <div key={change.id} className="border-l-2 border-blue-500 pl-3 py-1">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      📝 Status Changed
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{formatDate(change.changeDate)}</span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-[var(--text-tertiary)]">From:</span>
                    <span className="ml-1 font-medium">{change.oldValue || "—"}</span>
                    <span className="mx-2">→</span>
                    <span className="text-[var(--text-tertiary)]">To:</span>
                    <span className="ml-1 font-medium">{change.newValue || "—"}</span>
                  </div>
                  {change.notes && (
                    <div className="text-xs mt-1 text-[var(--text-tertiary)]">{change.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
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
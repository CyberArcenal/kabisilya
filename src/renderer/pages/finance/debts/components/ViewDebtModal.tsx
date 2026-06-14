// src/renderer/pages/finance/debts/components/ViewDebtModal.tsx
import React, { useState, useEffect } from "react";
import type { DebtWithDetails } from "../types";
import debtHistoryAPI from "../../../../api/core/debt_history";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtWithDetails | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const ViewDebtModal: React.FC<Props> = ({ isOpen, onClose, debt }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!debt || !isOpen) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await debtHistoryAPI.getAll({ debtId: debt.id, limit: 100 });
        if (res.status) setHistory(res.data.items);
      } catch (error) {
        console.error("Failed to fetch debt history", error);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [debt, isOpen]);

  if (!debt) return null;

  // Calculate progress percentage (clamped between 0 and 100)
  const progressPercent = debt.amount > 0
    ? Math.min(100, Math.max(0, ((debt.amount - debt.balance) / debt.amount) * 100))
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Debt Details" size="lg">
      <div className="space-y-5">
        {/* Debt info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Worker</label>
            <p className="text-[var(--text-primary)] font-medium">{debt.worker?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Session</label>
            <p>{debt.session?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Amount</label>
            <p>{formatCurrency(debt.amount)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Balance</label>
            <div className="flex flex-col">
              <span>{formatCurrency(debt.balance)}</span>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Due Date</label>
            <p>{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Interest Rate</label>
            <p>{debt.interestRate}%</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{debt.status}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Reason</label>
            <p className="whitespace-pre-wrap">{debt.reason || "—"}</p>
          </div>
        </div>

        {/* Debt History Tab */}
        <div>
          <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Payment / Adjustment History</label>
          {loadingHistory ? (
            <div className="p-4 text-center text-[var(--text-tertiary)]">Loading history...</div>
          ) : history.length === 0 ? (
            <p className="p-4 text-center text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-lg">No history records found</p>
          ) : (
            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--card-secondary-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-right">Amount Paid</th>
                    <th className="px-3 py-2 text-right">Previous Balance</th>
                    <th className="px-3 py-2 text-right">New Balance</th>
                    <th className="px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">{new Date(h.transactionDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 capitalize">{h.transactionType}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(h.amountPaid || 0)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(h.previousBalance)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(h.newBalance)}</td>
                      <td className="px-3 py-2">{h.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewDebtModal;
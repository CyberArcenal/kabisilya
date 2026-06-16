import React, { useState } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import { dialogs } from "../../../../utils/dialogs";

interface PayAllDebtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: number;
  workerName: string;
  totalDebtBalance: number;
  onPay: (data: {
    totalAmount: number;
    debtDeduction: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => Promise<void>;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

export const PayAllDebtsModal: React.FC<PayAllDebtsModalProps> = ({
  isOpen,
  onClose,
  workerId,
  workerName,
  totalDebtBalance,
  onPay,
}) => {
  const [amount, setAmount] = useState(totalDebtBalance);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      dialogs.warning("Amount must be greater than zero.");
      return;
    }
    if (amount > totalDebtBalance) {
      dialogs.warning(`Amount cannot exceed total debt balance of ${formatCurrency(totalDebtBalance)}.`);
      return;
    }

    setSubmitting(true);
    try {
      await onPay({
        totalAmount: amount,
        debtDeduction: amount, // all goes to debt
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });
      onClose();
    } catch (error: any) {
      dialogs.error(error.message || "Failed to process payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const setMaxAmount = () => setAmount(totalDebtBalance);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pay All Debts – ${workerName}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center">
          <p className="text-sm text-amber-600 font-medium">Total Debt Balance</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {formatCurrency(totalDebtBalance)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount to Pay (₱) *</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={totalDebtBalance}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <Button type="button" variant="secondary" size="sm" onClick={setMaxAmount}>
              Full
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="cash">💵 Cash</option>
            <option value="bank_transfer">🏦 Bank Transfer</option>
            <option value="gcash">📱 GCash</option>
            <option value="cheque">📝 Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reference Number (optional)</label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>
            💰 Pay All Debts
          </Button>
        </div>
      </form>
    </Modal>
  );
};
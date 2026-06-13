// src/renderer/pages/finance/debts/components/RecordPaymentModal.tsx
import React, { useState } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId: number;
  workerName: string;
  currentBalance: number;
  onSuccess: () => void;
  onPay: (debtId: number, amount: number, notes?: string) => Promise<void>;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  debtId,
  workerName,
  currentBalance,
  onSuccess,
  onPay,
}) => {
  const [amount, setAmount] = useState<number>(currentBalance);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > currentBalance) return;
    setSubmitting(true);
    try {
      await onPay(debtId, amount, notes || undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFullPayment = () => setAmount(currentBalance);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Debt Payment" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Record payment for <strong>{workerName}</strong><br />
          Current balance: <strong>{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(currentBalance)}</strong>
        </p>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Amount (₱)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={currentBalance}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
          {amount !== currentBalance && (
            <button type="button" onClick={handleFullPayment} className="text-xs text-[var(--primary-color)] hover:underline mt-1">Pay in full</button>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes (optional)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>Record Payment</Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
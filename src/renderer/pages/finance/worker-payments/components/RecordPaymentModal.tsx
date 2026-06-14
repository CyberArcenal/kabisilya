import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import { showWarning, showSuccess } from "../../../../utils/notification";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: number;
  workerName: string;
  grossPay: number;
  currentAmountPaid: number;
  outstandingDebt: number;
  onRecord: (data: {
    amountPaid: number;
    applyToDebt: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => Promise<void>;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentId,
  workerName,
  grossPay,
  currentAmountPaid,
  outstandingDebt,
  onRecord,
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [applyToDebt, setApplyToDebt] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maxAmount = grossPay - currentAmountPaid;
  const maxApplyToDebt = Math.min(amountPaid, outstandingDebt);
  const netToWorker = amountPaid - applyToDebt;

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(0);
      setApplyToDebt(0);
      setPaymentMethod("cash");
      setReferenceNumber("");
      setNotes("");
    }
  }, [isOpen]);

  const handleAmountPaidChange = (val: number) => {
    const newAmount = Math.min(val, maxAmount);
    setAmountPaid(newAmount);
    // Reset applyToDebt if it exceeds new amount
    if (applyToDebt > newAmount) {
      setApplyToDebt(newAmount);
    }
  };

  const handleApplyToDebtChange = (val: number) => {
    const capped = Math.min(val, amountPaid, outstandingDebt);
    setApplyToDebt(capped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaid <= 0) {
      showWarning("Amount paid must be greater than zero.");
      return;
    }
    if (amountPaid > maxAmount) {
      showWarning(`Amount paid cannot exceed remaining balance (${maxAmount}).`);
      return;
    }
    if (applyToDebt < 0 || applyToDebt > amountPaid) {
      showWarning("Apply to debt amount must be between 0 and amount paid.");
      return;
    }
    if (applyToDebt > outstandingDebt) {
      showWarning("Apply to debt cannot exceed worker's outstanding debt.");
      return;
    }
    setSubmitting(true);
    try {
      await onRecord({
        amountPaid,
        applyToDebt,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });
      showSuccess("Payment recorded successfully.");
      onClose();
    } catch (error: any) {
      showWarning(error.message || "Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const isApplyToDebtDisabled = amountPaid <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary block */}
        <div className="bg-[var(--card-secondary-bg)] p-4 rounded-lg grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Worker</p>
            <p className="font-medium text-[var(--text-primary)]">{workerName}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Gross Pay</p>
            <p className="font-medium">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(grossPay)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Already Paid</p>
            <p>{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(currentAmountPaid)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Remaining Balance</p>
            <p className="font-medium">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(maxAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Outstanding Debt</p>
            <p className="font-medium text-red-600 dark:text-red-400">{new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(outstandingDebt)}</p>
          </div>
        </div>

        {/* Two‑column fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount Paid (₱) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount}
              value={amountPaid}
              onChange={(e) => handleAmountPaidChange(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Apply to Debt (₱)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={applyToDebt}
              onChange={(e) => handleApplyToDebtChange(parseFloat(e.target.value) || 0)}
              disabled={isApplyToDebtDisabled}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
            {isApplyToDebtDisabled && (
              <p className="text-xs text-[var(--warning-color)] mt-1">Enter amount paid first</p>
            )}
            {!isApplyToDebtDisabled && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Max: {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(maxApplyToDebt)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="gcash">GCash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Net to Worker (₱)</label>
          <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-[var(--text-primary)]">
            {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(netToWorker)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
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
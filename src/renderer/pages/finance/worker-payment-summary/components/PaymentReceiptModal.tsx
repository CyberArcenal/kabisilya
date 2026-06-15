// src/renderer/pages/finance/worker-payment-summary/components/PaymentReceiptModal.tsx
import React from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import { CheckCircle, Receipt } from "lucide-react";

interface PaymentReceiptData {
  totalAmount: number;
  debtDeducted: number;
  paymentsUpdated: number;
  remainingUnallocated: number;
  totalPaymentsDue: number;
  totalDebtBalance: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  paymentData: PaymentReceiptData | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

export const PaymentReceiptModal: React.FC<Props> = ({ isOpen, onClose, workerName, paymentData }) => {
  if (!paymentData) return null;

  const {
    totalAmount,
    debtDeducted,
    paymentsUpdated,
    remainingUnallocated,
    totalPaymentsDue,
    totalDebtBalance,
  } = paymentData;

  const netToWorker = totalAmount - debtDeducted;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" size="md">
      <div className="space-y-5">
        {/* Header with icon */}
        <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
          <Receipt className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-bold">Payment Successful</h3>
            <p className="text-sm text-[var(--text-secondary)]">Worker: {workerName}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-color)]" />

        {/* Transaction details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Total Amount Paid</span>
            <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Debt Deduction</span>
            <span className="text-red-500 font-medium">{formatCurrency(debtDeducted)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-dashed border-[var(--border-color)]">
            <span className="font-semibold">Net to Worker</span>
            <span className="font-bold text-emerald-600">{formatCurrency(netToWorker)}</span>
          </div>
        </div>

        {/* Debt & Payment status */}
        <div className="bg-[var(--card-secondary-bg)] p-3 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Outstanding Debt Before</span>
            <span>{formatCurrency(totalDebtBalance + debtDeducted)}</span>
          </div>
          <div className="flex justify-between">
            <span>Outstanding Debt After</span>
            <span>{formatCurrency(totalDebtBalance)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Payments Before</span>
            <span>{formatCurrency(totalPaymentsDue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payments Cleared</span>
            <span>{paymentsUpdated} payment(s)</span>
          </div>
        </div>

        {/* Notes */}
        {remainingUnallocated > 0 && (
          <div className="text-amber-600 text-sm text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
            ⚠️ {formatCurrency(remainingUnallocated)} could not be allocated (system rounded)
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose} icon={CheckCircle}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
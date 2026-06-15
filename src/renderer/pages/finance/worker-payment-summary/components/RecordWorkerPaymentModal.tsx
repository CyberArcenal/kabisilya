// src/renderer/pages/finance/worker-payment-summary/components/RecordWorkerPaymentModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import paymentAPI from "../../../../api/core/payment";
import debtAPI from "../../../../api/core/debt";
import { showWarning, showError } from "../../../../utils/notification";
import { PaymentReceiptModal } from "./PaymentReceiptModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workerId: number;
  workerName: string;
  onSuccess: () => void;
  totalOutstandingPayments?: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const roundToTwo = (num: number): number => {
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const RecordWorkerPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  workerId,
  workerName,
  onSuccess,
}) => {
  const [amountPaid, setAmountPaid] = useState(0);
  const [applyToDebt, setApplyToDebt] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalDebtBalance, setTotalDebtBalance] = useState(0);
  const [pendingPaymentsDue, setPendingPaymentsDue] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (isOpen && workerId) {
      const fetchData = async () => {
        setFetching(true);
        try {
          const pendingRes = await debtAPI.getAll({ workerId, status: "pending", limit: 1000 });
          const partiallyRes = await debtAPI.getAll({ workerId, status: "partially_paid", limit: 1000 });
          let debtBalance = 0;
          if (pendingRes.status) debtBalance += pendingRes.data.items.reduce((sum, d) => sum + d.balance, 0);
          if (partiallyRes.status) debtBalance += partiallyRes.data.items.reduce((sum, d) => sum + d.balance, 0);
          setTotalDebtBalance(roundToTwo(debtBalance));

          const pendingPayments = await paymentAPI.getAll({ workerId, status: "pending", limit: 1000 });
          const partiallyPaidPayments = await paymentAPI.getAll({ workerId, status: "partially_paid", limit: 1000 });
          let paymentsDue = 0;
          if (pendingPayments.status) {
            paymentsDue += pendingPayments.data.items.reduce((sum, p) => sum + (p.netPay - (p.amountPaid || 0)), 0);
          }
          if (partiallyPaidPayments.status) {
            paymentsDue += partiallyPaidPayments.data.items.reduce((sum, p) => sum + (p.netPay - (p.amountPaid || 0)), 0);
          }
          setPendingPaymentsDue(roundToTwo(paymentsDue));
        } catch (error) {
          console.error("Failed to fetch modal data", error);
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    }
  }, [isOpen, workerId]);

  useEffect(() => {
    if (!isOpen) {
      setAmountPaid(0);
      setApplyToDebt(0);
      setPaymentMethod("cash");
      setReferenceNumber("");
      setNotes("");
      setTotalDebtBalance(0);
      setPendingPaymentsDue(0);
    }
  }, [isOpen]);

  const totalDue = roundToTwo(pendingPaymentsDue + totalDebtBalance);
  const maxApplyToDebt = roundToTwo(Math.min(amountPaid, totalDebtBalance));
  const netToWorker = roundToTwo(amountPaid - applyToDebt);
  const hasPendingPayments = pendingPaymentsDue > 0;

  const handleAmountChange = (val: number) => {
    if (!hasPendingPayments) return; // disallow input when no pending payments
    const raw = roundToTwo(val);
    const newAmount = Math.min(raw, totalDue);
    setAmountPaid(newAmount);
    setApplyToDebt((prev) => roundToTwo(Math.min(prev, Math.min(newAmount, totalDebtBalance))));
  };

  const setMaxAmount = () => {
    if (!hasPendingPayments) return;
    setAmountPaid(totalDue);
    const maxDebt = Math.min(totalDue, totalDebtBalance);
    setApplyToDebt(maxDebt);
  };

  const setDebtPercentage = useCallback(
    (percent: number) => {
      if (!hasPendingPayments) return;
      if (amountPaid <= 0) {
        showWarning("Please enter Amount Paid first.");
        return;
      }
      if (totalDebtBalance === 0) {
        showWarning("No outstanding debt to apply.");
        return;
      }
      let target = (totalDebtBalance * percent) / 100;
      target = roundToTwo(target);
      const capped = Math.min(target, amountPaid, totalDebtBalance);
      setApplyToDebt(roundToTwo(capped));
    },
    [amountPaid, totalDebtBalance, hasPendingPayments]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPendingPayments) {
      showWarning("No pending payments for this worker. Cannot record payment.");
      return;
    }
    const finalAmount = roundToTwo(amountPaid);
    const finalDebt = roundToTwo(applyToDebt);
    const amountForPayments = finalAmount - finalDebt;

    if (finalAmount <= 0) {
      showWarning("Amount paid must be greater than zero.");
      return;
    }
    if (finalAmount > totalDue) {
      showWarning(`Amount paid cannot exceed total due (${formatCurrency(totalDue)}).`);
      return;
    }
    if (finalDebt < 0 || finalDebt > finalAmount) {
      showWarning("Apply to debt must be between 0 and amount paid.");
      return;
    }
    if (amountForPayments > pendingPaymentsDue) {
      showWarning(
        `Amount for payments (${formatCurrency(amountForPayments)}) exceeds pending payments due (${formatCurrency(pendingPaymentsDue)}). ` +
        `Please reduce the amount paid or increase debt deduction.`
      );
      return;
    }

    setLoading(true);
    try {
      const response = await paymentAPI.recordWorkerPayment({
        workerId,
        totalAmount: finalAmount,
        debtDeduction: finalDebt,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      if (response.status && response.data) {
        setReceiptData({
          totalAmount: response.data.totalAmount,
          debtDeducted: response.data.debtDeducted,
          paymentsUpdated: response.data.paymentsUpdated,
          remainingUnallocated: response.data.remainingUnallocated || 0,
          totalPaymentsDue: response.data.totalPaymentsDue || 0,
          totalDebtBalance: response.data.totalDebtBalance || 0,
        });
        setShowReceipt(true);
      } else {
        showError(response.message || "Payment failed");
      }
    } catch (error: any) {
      showError(error.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setReceiptData(null);
    onSuccess();
    onClose();
  };

  if (fetching) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for ${workerName}`} size="lg">
        <div className="flex justify-center py-8">
          <div className="text-center">Loading payment data...</div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for ${workerName}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[var(--card-secondary-bg)] p-4 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Payments Due</p>
              <p className="font-medium">{formatCurrency(pendingPaymentsDue)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Outstanding Debt</p>
              <p className="font-medium text-red-500">{formatCurrency(totalDebtBalance)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-[var(--text-secondary)]">Total Due</p>
              <p className="font-bold text-lg">{formatCurrency(totalDue)}</p>
            </div>
          </div>

          {!hasPendingPayments && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-amber-600 text-sm text-center">
              No pending payments for this worker. Payment cannot be recorded.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Amount Paid (₱) *</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={totalDue}
                value={amountPaid}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                required
                disabled={!hasPendingPayments}
                className="flex-1 px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={setMaxAmount}
                disabled={!hasPendingPayments}
                className="whitespace-nowrap"
              >
                Max
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Apply to Debt (₱)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={maxApplyToDebt}
                value={applyToDebt}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setApplyToDebt(roundToTwo(Math.min(val, maxApplyToDebt)));
                }}
                disabled={!hasPendingPayments || !amountPaid}
                className="flex-1 px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDebtPercentage(10)}
                  disabled={!hasPendingPayments || amountPaid <= 0 || totalDebtBalance === 0}
                >
                  10%
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDebtPercentage(50)}
                  disabled={!hasPendingPayments || amountPaid <= 0 || totalDebtBalance === 0}
                >
                  50%
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDebtPercentage(100)}
                  disabled={!hasPendingPayments || amountPaid <= 0 || totalDebtBalance === 0}
                >
                  100%
                </Button>
              </div>
            </div>
            {!hasPendingPayments && (
              <p className="text-xs text-amber-500 mt-1">No pending payments available</p>
            )}
            {hasPendingPayments && !amountPaid && (
              <p className="text-xs text-[var(--warning-color)] mt-1">Enter amount paid first</p>
            )}
            {hasPendingPayments && totalDebtBalance === 0 && amountPaid > 0 && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">No outstanding debt to apply</p>
            )}
            {hasPendingPayments && totalDebtBalance > 0 && amountPaid > 0 && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Max debt deduction: {formatCurrency(maxApplyToDebt)} (outstanding debt: {formatCurrency(totalDebtBalance)})
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={!hasPendingPayments}
                className="w-full px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="gcash">GCash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                disabled={!hasPendingPayments}
                className="w-full px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Net to Worker (₱)</label>
            <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold">
              {formatCurrency(netToWorker)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!hasPendingPayments}
              className="w-full px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" loading={loading} disabled={!hasPendingPayments || amountPaid===0}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      <PaymentReceiptModal
        isOpen={showReceipt}
        onClose={handleReceiptClose}
        workerName={workerName}
        paymentData={receiptData}
      />
    </>
  );
};
// components/RecordWorkerPaymentModal.tsx
import React, { useState, useEffect } from "react";
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

// ✅ Round to 2 decimal places
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
          const [pendingRes, partiallyRes, paymentsRes, partiallyPaidRes] = await Promise.all([
            debtAPI.getAll({ workerId, status: "pending", limit: 1000 }),
            debtAPI.getAll({ workerId, status: "partially_paid", limit: 1000 }),
            paymentAPI.getAll({ workerId, status: "pending", limit: 1000 }),
            paymentAPI.getAll({ workerId, status: "partially_paid", limit: 1000 }),
          ]);
          let debtBalance = 0;
          if (pendingRes.status) debtBalance += pendingRes.data.items.reduce((s, d) => s + d.balance, 0);
          if (partiallyRes.status) debtBalance += partiallyRes.data.items.reduce((s, d) => s + d.balance, 0);
          setTotalDebtBalance(roundToTwo(debtBalance));

          let paymentsDue = 0;
          if (paymentsRes.status) {
            paymentsDue += paymentsRes.data.items.reduce((s, p) => s + (p.netPay - (p.amountPaid || 0)), 0);
          }
          if (partiallyPaidRes.status) {
            paymentsDue += partiallyPaidRes.data.items.reduce((s, p) => s + (p.netPay - (p.amountPaid || 0)), 0);
          }
          setPendingPaymentsDue(roundToTwo(paymentsDue));
        } catch (error) {
          console.error(error);
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    }
  }, [isOpen, workerId]);

  const totalDue = roundToTwo(pendingPaymentsDue + totalDebtBalance);
  const maxApplyToDebt = roundToTwo(Math.min(amountPaid, totalDebtBalance));
  const netToWorker = roundToTwo(amountPaid - applyToDebt);
  const hasPendingPayments = pendingPaymentsDue > 0;

  const handleAmountChange = (val: number) => {
    if (!hasPendingPayments) return;
    let newAmount = roundToTwo(val);
    newAmount = Math.min(newAmount, totalDue);
    setAmountPaid(newAmount);
    // Adjust debt if it exceeds new amount
    if (applyToDebt > newAmount) setApplyToDebt(newAmount);
  };

  const handleDebtSlider = (val: number) => {
    const capped = roundToTwo(Math.min(val, maxApplyToDebt));
    setApplyToDebt(capped);
  };

  const setMaxAmount = () => {
    if (!hasPendingPayments) return;
    setAmountPaid(pendingPaymentsDue);
    setApplyToDebt(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure all values are rounded
    const finalAmount = roundToTwo(amountPaid);
    const finalDebt = roundToTwo(applyToDebt);
    const amountForPayments = roundToTwo(finalAmount - finalDebt);

    if (!hasPendingPayments) {
      showWarning("No pending payments for this worker.");
      return;
    }
    if (finalAmount <= 0) {
      showWarning("Amount paid must be greater than zero.");
      return;
    }
    if (finalAmount > totalDue) {
      showWarning(`Amount paid cannot exceed total due (${formatCurrency(totalDue)}).`);
      return;
    }
    if (finalDebt < 0 || finalDebt > finalAmount) {
      showWarning("Debt deduction must be between 0 and amount paid.");
      return;
    }
    if (amountForPayments > pendingPaymentsDue) {
      showWarning(
        `Amount for payments (${formatCurrency(amountForPayments)}) exceeds pending payments (${formatCurrency(pendingPaymentsDue)}).`
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
        setReceiptData(response.data);
        onClose();
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
  };

  if (fetching) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for ${workerName}`} size="lg">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]" />
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`💰 Record Payment – ${workerName}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
              <p className="text-xs text-amber-600">Pending Payments</p>
              <p className="text-lg font-bold">{formatCurrency(pendingPaymentsDue)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
              <p className="text-xs text-red-600">Outstanding Debt</p>
              <p className="text-lg font-bold">{formatCurrency(totalDebtBalance)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
              <p className="text-xs text-emerald-600">Total Due</p>
              <p className="text-lg font-bold">{formatCurrency(totalDue)}</p>
            </div>
          </div>

          {/* Amount Paid */}
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
                className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)]"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={setMaxAmount}
                disabled={!hasPendingPayments}
                title="Fill with total pending payments only (debt not included)"
              >
                Max (Pending)
              </Button>
            </div>
          </div>

          {/* Debt Deduction Slider */}
          {totalDebtBalance > 0 && amountPaid > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label>Apply to Debt (₱)</label>
                <span className="text-[var(--text-secondary)]">
                  Max: {formatCurrency(maxApplyToDebt)}
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={maxApplyToDebt}
                  step={0.01}
                  value={applyToDebt}
                  onChange={(e) => handleDebtSlider(parseFloat(e.target.value))}
                  className="flex-1"
                  disabled={!hasPendingPayments}
                />
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={maxApplyToDebt}
                  value={applyToDebt}
                  onChange={(e) => handleDebtSlider(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-1 rounded border"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
                  disabled={!hasPendingPayments}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[10, 25, 50, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      let target = roundToTwo((totalDebtBalance * pct) / 100);
                      target = Math.min(target, maxApplyToDebt);
                      handleDebtSlider(target);
                    }}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200/60"
                    disabled={!hasPendingPayments || amountPaid === 0}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Net to Worker */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-emerald-600 font-medium">Net to Worker</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(netToWorker)}
            </p>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              >
                <option value="cash">💵 Cash</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="gcash">📱 GCash</option>
                <option value="cheque">📝 Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)" }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              disabled={!hasPendingPayments || amountPaid === 0}
            >
              💸 Confirm Payment
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
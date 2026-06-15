// src/renderer/pages/finance/worker-payment-summary/utils/aggregatePayments.ts
import type { Payment } from "../../../../api/core/payment";

export interface WorkerPaymentSummary {
  workerId: number;
  workerName: string;
  totalGross: number;
  totalDebtDeduction: number;      // total debt deducted from payments (galing sa `totalDebtDeduction` field)
  totalNet: number;
  totalPaid: number;                // total amount paid (sum of amountPaid)
  paymentCount: number;
  totalOutstandingPayments: number; // netPay - amountPaid para lamang sa pending/partially_paid
  totalDebtBalance: number;         // outstanding debt balance (mula sa debtAPI)
  payments: Payment[];
}

export const aggregateByWorker = (payments: Payment[]): WorkerPaymentSummary[] => {
  const map = new Map<number, WorkerPaymentSummary>();
  for (const p of payments) {
    if (!p.worker) continue;
    const existing = map.get(p.worker.id);
    const isPendingOrPartially = p.status === "pending" || p.status === "partially_paid";
    const outstanding = isPendingOrPartially ? (p.netPay - (p.amountPaid || 0)) : 0;

    if (existing) {
      existing.totalGross += p.grossPay;
      existing.totalDebtDeduction += p.totalDebtDeduction || 0;
      existing.totalNet += p.netPay;
      existing.totalPaid += p.amountPaid || 0;
      existing.paymentCount += 1;
      existing.totalOutstandingPayments += outstanding;
      existing.payments.push(p);
    } else {
      map.set(p.worker.id, {
        workerId: p.worker.id,
        workerName: p.worker.name,
        totalGross: p.grossPay,
        totalDebtDeduction: p.totalDebtDeduction || 0,
        totalNet: p.netPay,
        totalPaid: p.amountPaid || 0,
        paymentCount: 1,
        totalOutstandingPayments: outstanding,
        totalDebtBalance: 0,
        payments: [p],
      });
    }
  }
  return Array.from(map.values());
};
import type { Debt } from "../../../../api/core/debt";

export interface WorkerDebtSummary {
  workerId: number;
  workerName: string;
  debtCount: number;
  totalAmount: number;
  totalBalance: number;        // kabuuang balance ng LAHAT ng utang (kabilang ang paid)
  activeBalance: number;       // balance ng active debts (pending/partially_paid na may balance > 0)
  statusBreakdown: Record<string, number>;
  debts: Debt[];
}

export const aggregateByWorker = (debts: Debt[]): WorkerDebtSummary[] => {
  const map = new Map<number, WorkerDebtSummary>();

  for (const debt of debts) {
    if (!debt.worker) continue;
    const existing = map.get(debt.worker.id);
    const status = debt.status;

    if (existing) {
      existing.debtCount += 1;
      existing.totalAmount += debt.amount;
      existing.totalBalance += debt.balance;
      // Kalkulahin ang activeBalance
      if (debt.balance > 0 && (status === "pending" || status === "partially_paid")) {
        existing.activeBalance += debt.balance;
      }
      existing.statusBreakdown[status] = (existing.statusBreakdown[status] || 0) + 1;
      existing.debts.push(debt);
    } else {
      const activeBalance =
        debt.balance > 0 && (status === "pending" || status === "partially_paid")
          ? debt.balance
          : 0;
      map.set(debt.worker.id, {
        workerId: debt.worker.id,
        workerName: debt.worker.name,
        debtCount: 1,
        totalAmount: debt.amount,
        totalBalance: debt.balance,
        activeBalance,
        statusBreakdown: { [status]: 1 },
        debts: [debt],
      });
    }
  }

  return Array.from(map.values());
};
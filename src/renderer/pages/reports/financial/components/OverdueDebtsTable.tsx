// src/renderer/pages/analytics/financial/components/OverdueDebtsTable.tsx
import React from "react";
import type { OverdueDebt } from "../types";

interface Props {
  overdueDebts: OverdueDebt[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const OverdueDebtsTable: React.FC<Props> = ({ overdueDebts }) => {
  if (overdueDebts.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
        No overdue debts
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-2 px-4">Worker</th>
            <th className="text-right py-2 px-4">Original Amount</th>
            <th className="text-right py-2 px-4">Balance</th>
            <th className="text-right py-2 px-4">Days Overdue</th>
            <th className="text-left py-2 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {overdueDebts.map((debt) => (
            <tr key={debt.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2 px-4">{debt.workerName}</td>
              <td className="py-2 px-4 text-right">{formatCurrency(debt.amount)}</td>
              <td className="py-2 px-4 text-right text-red-500">{formatCurrency(debt.balance)}</td>
              <td className="py-2 px-4 text-right">{debt.daysOverdue}</td>
              <td className="py-2 px-4 capitalize">{debt.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OverdueDebtsTable;
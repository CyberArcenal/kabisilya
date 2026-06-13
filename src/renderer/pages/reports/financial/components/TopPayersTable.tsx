// src/renderer/pages/analytics/financial/components/TopPayersTable.tsx
import React from "react";
import type { TopPayer } from "../types";

interface Props {
  topPayers: TopPayer[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const TopPayersTable: React.FC<Props> = ({ topPayers }) => {
  if (topPayers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
        No data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-2 px-4">Worker</th>
            <th className="text-right py-2 px-4">Total Net Pay</th>
            <th className="text-right py-2 px-4">Payment Count</th>
            <th className="text-right py-2 px-4">Average Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {topPayers.map((payer, idx) => (
            <tr key={payer.workerId} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2 px-4 font-medium">{payer.workerName}</td>
              <td className="py-2 px-4 text-right">{formatCurrency(payer.totalNet)}</td>
              <td className="py-2 px-4 text-right">{payer.paymentCount}</td>
              <td className="py-2 px-4 text-right">{formatCurrency(payer.totalNet / payer.paymentCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopPayersTable;
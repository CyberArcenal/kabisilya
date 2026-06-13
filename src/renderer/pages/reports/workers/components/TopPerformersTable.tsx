// src/renderer/pages/analytics/workers/components/TopPerformersTable.tsx
import React from "react";
import type { TopPerformer } from "../types";

interface Props {
  performers: TopPerformer[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const TopPerformersTable: React.FC<Props> = ({ performers }) => {
  if (!performers.length) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
        No top performer data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-2 px-4">Worker</th>
            <th className="text-left py-2 px-4">Metric</th>
            <th className="text-right py-2 px-4">Value</th>
            <th className="text-right py-2 px-4">Secondary</th>
          </tr>
        </thead>
        <tbody>
          {performers.map((p, idx) => (
            <tr key={p.workerId} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2 px-4 font-medium">{p.workerName}</td>
              <td className="py-2 px-4 capitalize">{p.metric}</td>
              <td className="py-2 px-4 text-right">
                {p.metric === "totalNetPay" ? formatCurrency(p.value) : p.value}
              </td>
              <td className="py-2 px-4 text-right">
                {p.secondaryLabel}: {p.metric === "totalNetPay" ? formatCurrency(p.secondaryValue) : p.secondaryValue.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopPerformersTable;
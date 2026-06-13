// src/renderer/pages/analytics/workers/components/WorkerPerformanceTable.tsx
import React from "react";
import type { WorkerPerformanceRow } from "../types";

interface Props {
  workers: WorkerPerformanceRow[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const WorkerPerformanceTable: React.FC<Props> = ({ workers }) => {
  if (workers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)]">
        No performance data for selected period
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Worker</th>
            <th className="text-right py-3 px-4">Assignments Completed</th>
            <th className="text-right py-3 px-4">Total Luwang</th>
            <th className="text-right py-3 px-4">Gross Pay</th>
            <th className="text-right py-3 px-4">Net Pay</th>
            <th className="text-right py-3 px-4">Productivity Score</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w) => (
            <tr key={w.workerId} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2.5 px-4 font-medium">{w.workerName}</td>
              <td className="py-2.5 px-4 text-right">{w.assignmentsCompleted}</td>
              <td className="py-2.5 px-4 text-right">{w.totalLuwang.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right">{formatCurrency(w.totalGrossPay)}</td>
              <td className="py-2.5 px-4 text-right">{formatCurrency(w.totalNetPay)}</td>
              <td className="py-2.5 px-4 text-right font-semibold text-[var(--primary-color)]">
                {w.productivityScore.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerPerformanceTable;
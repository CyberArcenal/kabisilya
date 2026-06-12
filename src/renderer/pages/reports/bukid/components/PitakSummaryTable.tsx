// src/renderer/pages/reports/bukid/components/PitakSummaryTable.tsx
import React from "react";
import type { PitakSummary } from "../types";

interface Props {
  pitaks: PitakSummary[];
  page: number;
  pageSize?: number;
}

const PitakSummaryTable: React.FC<Props> = ({ pitaks, page, pageSize = 10 }) => {
  const start = (page - 1) * pageSize;
  const paginated = pitaks.slice(start, start + pageSize);

  if (paginated.length === 0) {
    return <div className="text-center py-8 text-[var(--text-tertiary)]">No data available</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Plot Location</th>
            <th className="text-right py-3 px-4">Total Luwang</th>
            <th className="text-right py-3 px-4">Completed Luwang</th>
            <th className="text-right py-3 px-4">Completion Rate</th>
            <th className="text-right py-3 px-4">Assignments</th>
            <th className="text-right py-3 px-4">Payments</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((p) => (
            <tr key={p.id} className="border-b border-[var(--border-color)]">
              <td className="py-2.5 px-4 font-medium">{p.location}</td>
              <td className="py-2.5 px-4 text-right">{p.totalLuwang}</td>
              <td className="py-2.5 px-4 text-right">{p.completedLuwang}</td>
              <td className="py-2.5 px-4 text-right">{p.completionRate.toFixed(1)}%</td>
              <td className="py-2.5 px-4 text-right">{p.totalAssignments}</td>
              <td className="py-2.5 px-4 text-right">₱{p.totalPayments.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PitakSummaryTable;
// src/renderer/pages/analytics/pitak/components/PitakPerformanceTable.tsx
import React from "react";

interface PitakRow {
  pitakId: number;
  location: string;
  status: string;
  bukidName: string;
  totalLuwang: number;
  metrics: {
    completedLuwang: number;
    activeLuwang: number;
    totalAssignments: number;
    completionRate: number;
    averageLuwangPerAssignment: number;
    utilization: number;
  };
}

interface Props {
  pitaks: PitakRow[];
}

const PitakPerformanceTable: React.FC<Props> = ({ pitaks }) => {
  if (pitaks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No pitak data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Plot</th>
            <th className="text-left py-3 px-4">Farm</th>
            <th className="text-right py-3 px-4">Total Luwang</th>
            <th className="text-right py-3 px-4">Completed</th>
            <th className="text-right py-3 px-4">Completion Rate</th>
            <th className="text-right py-3 px-4">Utilization</th>
            <th className="text-left py-3 px-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {pitaks.map((p) => (
            <tr key={p.pitakId} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2.5 px-4 font-medium">{p.location}</td>
              <td className="py-2.5 px-4">{p.bukidName}</td>
              <td className="py-2.5 px-4 text-right">{p.totalLuwang}</td>
              <td className="py-2.5 px-4 text-right">{p.metrics.completedLuwang.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-right">{p.metrics.completionRate.toFixed(1)}%</td>
              <td className="py-2.5 px-4 text-right">{p.metrics.utilization.toFixed(1)}%</td>
              <td className="py-2.5 px-4 capitalize">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PitakPerformanceTable;
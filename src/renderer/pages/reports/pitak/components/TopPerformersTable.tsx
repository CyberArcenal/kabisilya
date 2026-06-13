// src/renderer/pages/analytics/pitak/components/TopPerformersTable.tsx
import React from "react";

interface TopPerformer {
  pitakId: number;
  location: string;
  completionRate: number;
  utilization: number;
  score: number;
}

interface Props {
  performers: TopPerformer[];
}

const TopPerformersTable: React.FC<Props> = ({ performers }) => {
  if (!performers.length) {
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
            <th className="text-left py-2 px-4">Plot</th>
            <th className="text-right py-2 px-4">Completion Rate</th>
            <th className="text-right py-2 px-4">Utilization</th>
            <th className="text-right py-2 px-4">Score</th>
          </tr>
        </thead>
        <tbody>
          {performers.map((p) => (
            <tr key={p.pitakId} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
              <td className="py-2 px-4 font-medium">{p.location}</td>
              <td className="py-2 px-4 text-right">{p.completionRate.toFixed(1)}%</td>
              <td className="py-2 px-4 text-right">{p.utilization.toFixed(1)}%</td>
              <td className="py-2 px-4 text-right font-semibold">{p.score.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopPerformersTable;
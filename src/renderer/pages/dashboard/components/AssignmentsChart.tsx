// src/renderer/pages/dashboard/components/AssignmentsChart.tsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
  data: Array<{ month: string; assignments: number }>;
}

const AssignmentsChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Assignments per Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="month" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
            labelStyle={{ color: "var(--text-primary)" }}
          />
          <Legend />
          <Bar dataKey="assignments" fill="#3b82f6" name="Assignments" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignmentsChart;
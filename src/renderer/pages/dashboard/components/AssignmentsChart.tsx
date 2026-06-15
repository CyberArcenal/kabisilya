import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMediaQuery } from "react-responsive";

interface Props { data: Array<{ month: string; assignments: number }>; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--card-bg)] p-3 rounded-lg shadow-lg border border-[var(--border-color)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="text-sm text-[var(--primary-color)]">Assignments: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const AssignmentsChart: React.FC<Props> = React.memo(({ data }) => {
  const prefersReducedMotion = useMediaQuery({ query: "(prefers-reduced-motion: reduce)" });
  const isAnimation = !prefersReducedMotion;

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)] shadow-sm transition-all hover:shadow-md">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
        <span className="w-1 h-6 bg-[var(--primary-color)] rounded-full" />
        Assignments per Month
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "var(--text-secondary)" }} axisLine={{ stroke: "var(--border-color)" }} />
          <YAxis tick={{ fill: "var(--text-secondary)" }} axisLine={{ stroke: "var(--border-color)" }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--card-hover-bg)" }} />
          <Legend wrapperStyle={{ color: "var(--text-secondary)" }} />
          <Bar dataKey="assignments" fill="#3b82f6" name="Assignments" radius={[6, 6, 0, 0]} animationDuration={isAnimation ? 800 : 0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default AssignmentsChart;
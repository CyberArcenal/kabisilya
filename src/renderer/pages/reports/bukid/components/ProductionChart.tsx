// src/renderer/pages/reports/bukid/components/ProductionChart.tsx
import React, { useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

interface Props {
  data: Array<{ month: string; totalLuwang: number; assignmentCount: number }>;
}

const ProductionChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "production-chart.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Production Trend</h3>
        <button onClick={handleExport} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)]">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div ref={chartRef}>
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
            <Bar dataKey="totalLuwang" fill="#10b981" name="Total Luwang" radius={[4, 4, 0, 0]} animationDuration={1000} />
            <Bar dataKey="assignmentCount" fill="#3b82f6" name="Assignments" radius={[4, 4, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductionChart;
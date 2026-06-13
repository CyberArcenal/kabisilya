// src/renderer/pages/analytics/financial/components/RevenueTrendChart.tsx
import React, { useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import type { RevenueDataPoint } from "../types";

interface Props {
  data: RevenueDataPoint[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

const RevenueTrendChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "revenue-trend.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Revenue Trend</h3>
        <button onClick={handleExport} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)]">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Revenue" />
            <Area type="monotone" dataKey="payments" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Payments" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
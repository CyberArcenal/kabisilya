// src/renderer/pages/analytics/financial/components/DebtCollectionChart.tsx
import React, { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";

interface Props {
  data: Array<{ name: string; collected: number; remaining: number }>;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

const DebtCollectionChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement("a");
      link.download = "debt-collection.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Debt Collection by Age</h3>
        <button onClick={handleExport} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)]">
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
              labelStyle={{ color: "var(--text-primary)" }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="collected" fill="#10b981" name="Collected" />
            <Bar dataKey="remaining" fill="#ef4444" name="Remaining" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DebtCollectionChart;
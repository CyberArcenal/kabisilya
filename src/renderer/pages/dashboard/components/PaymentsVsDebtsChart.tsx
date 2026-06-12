// src/renderer/pages/dashboard/components/PaymentsVsDebtsChart.tsx
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

interface Props {
  data: Array<{ month: string; payments: number; debts: number }>;
}

const PaymentsVsDebtsChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)]">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Payments vs New Debts</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="month" stroke="var(--text-secondary)" />
          <YAxis stroke="var(--text-secondary)" />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
            labelStyle={{ color: "var(--text-primary)" }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Area type="monotone" dataKey="payments" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Payments" />
          <Area type="monotone" dataKey="debts" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="New Debts" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentsVsDebtsChart;
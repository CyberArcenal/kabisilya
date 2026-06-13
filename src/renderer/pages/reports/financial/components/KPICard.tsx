// src/renderer/pages/analytics/financial/components/KPICard.tsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change && change > 0;
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
            {typeof value === "number" ? formatCurrency(value) : value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(change)}% from previous period</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
// src/renderer/pages/reports/bukid/components/KPICard.tsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: number;
}

const KPICard: React.FC<Props> = ({ title, value, icon, color, change }) => {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{Number(value).toFixed(0)}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}% from previous
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
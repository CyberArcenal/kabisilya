// src/renderer/pages/dashboard/components/KPICard.tsx
import React from "react";
import { TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
      style={{
        borderImage: `linear-gradient(135deg, ${color}, var(--primary-color)) 1`,
        borderImageSlice: 1,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`} />
              {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
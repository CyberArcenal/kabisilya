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

const KPICard: React.FC<KPICardProps> = React.memo(({
  title, value, icon, color, trend, onClick
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[var(--card-bg)] rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
    >
      {/* hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
           style={{ boxShadow: `0 0 0 2px ${color}40` }} />
      
      <div className="relative z-10 flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] mt-1 break-words">
            {value}
          </p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? "rotate-180" : ""}`} />
              {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="flex-shrink-0 p-2 sm:p-3 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
             style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
});

export default KPICard;
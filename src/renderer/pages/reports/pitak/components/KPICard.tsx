// src/renderer/pages/analytics/pitak/components/KPICard.tsx
import React from "react";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] transition-all hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
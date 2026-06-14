// src/renderer/pages/workers/components/WorkerSummaryCards.tsx
import React from "react";
import { Users, UserCheck, UserMinus, UserX } from "lucide-react";

interface WorkerSummaryCardsProps {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const WorkerSummaryCards: React.FC<WorkerSummaryCardsProps> = ({
  total,
  active,
  onLeave,
  terminated,
}) => {
  const cards = [
    { title: "Total Workers", value: total, icon: Users, color: "bg-blue-500", format: formatNumber },
    { title: "Active", value: active, icon: UserCheck, color: "bg-green-500", format: formatNumber },
    { title: "On Leave", value: onLeave, icon: UserMinus, color: "bg-yellow-500", format: formatNumber },
    { title: "Terminated", value: terminated, icon: UserX, color: "bg-red-500", format: formatNumber },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{card.format(card.value)}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
              <card.icon className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkerSummaryCards;
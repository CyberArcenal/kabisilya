import React from "react";
import {
  ClipboardList,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import type { AssignmentStats } from "../../../../api/core/assignment";

const formatNumber = (num: number) => num.toLocaleString();

const AssignmentSummaryCards: React.FC<AssignmentStats> = ({
  total,
  active,
  completed,
  totalLuwang,
  cancelled,
  initiated,
}) => {
  const cards = [
    {
      title: "Total Assignments",
      value: total,
      icon: ClipboardList,
      color: "bg-blue-500",
      format: formatNumber,
    },
    {
      title: "Active Assignments",
      value: active,
      icon: TrendingUp,
      color: "bg-green-500",
      format: formatNumber,
    },
    {
      title: "Completed Assignments",
      value: completed,
      icon: TrendingDown,
      color: "bg-gray-500",
      format: formatNumber,
    },
    {
      title: "Total Luwang",
      value: totalLuwang,
      icon: BarChart3,
      color: "bg-purple-500",
      format: (v: number) => `${v.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {card.format(card.value)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
              <card.icon
                className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentSummaryCards;

// src/renderer/pages/system/sessions/components/SessionSummaryCards.tsx
import React from "react";
import { Calendar, CheckCircle, Clock, Archive } from "lucide-react";

interface SessionSummaryCardsProps {
  total: number;
  active: number;
  closed: number;
  archived: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const SessionSummaryCards: React.FC<SessionSummaryCardsProps> = ({
  total,
  active,
  closed,
  archived,
}) => {
  const cards = [
    { title: "Total Sessions", value: total, icon: Calendar, color: "bg-blue-500", format: formatNumber },
    { title: "Active", value: active, icon: CheckCircle, color: "bg-green-500", format: formatNumber },
    { title: "Closed", value: closed, icon: Clock, color: "bg-yellow-500", format: formatNumber },
    { title: "Archived", value: archived, icon: Archive, color: "bg-gray-500", format: formatNumber },
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

export default SessionSummaryCards;
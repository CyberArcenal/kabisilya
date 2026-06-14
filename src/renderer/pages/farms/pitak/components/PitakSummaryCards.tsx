// src/renderer/pages/farms/pitak/components/PitakSummaryCards.tsx
import React from "react";
import { Package, TrendingUp, TrendingDown, MapPin, Users } from "lucide-react";

interface PitakSummaryCardsProps {
  totalPlots: number;
  activePlots: number;
  completedPlots: number;
  totalArea: number;
  totalWorkers?: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const PitakSummaryCards: React.FC<PitakSummaryCardsProps> = ({
  totalPlots,
  activePlots,
  completedPlots,
  totalArea,
  totalWorkers = 0,
}) => {
  const cards = [
    { title: "Total Plots", value: totalPlots, icon: Package, color: "bg-blue-500", format: formatNumber },
    { title: "Active Plots", value: activePlots, icon: TrendingUp, color: "bg-green-500", format: formatNumber },
    { title: "Completed Plots", value: completedPlots, icon: TrendingDown, color: "bg-gray-500", format: formatNumber },
    { title: "Total Area (luwang)", value: totalArea, icon: MapPin, color: "bg-purple-500", format: (v: number) => `${v.toFixed(2)}` },
  ];
  if (totalWorkers > 0) {
    cards.push({ title: "Assigned Workers", value: totalWorkers, icon: Users, color: "bg-orange-500", format: formatNumber });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {card.format(card.value)}
              </p>
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

export default PitakSummaryCards;
import React from "react";
import { Warehouse, TrendingUp, TrendingDown, MapPin, Activity } from "lucide-react";

interface BukidSummaryCardsProps {
  totalFarms: number;
  activeFarms: number;
  completedFarms: number;
  totalArea: number;   // total luwang
  totalPitaks?: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const BukidSummaryCards: React.FC<BukidSummaryCardsProps> = ({
  totalFarms,
  activeFarms,
  completedFarms,
  totalArea,
  totalPitaks = 0,
}) => {
  const cards = [
    { title: "Total Farms", value: totalFarms, icon: Warehouse, color: "bg-blue-500", format: formatNumber },
    { title: "Active Farms", value: activeFarms, icon: TrendingUp, color: "bg-green-500", format: formatNumber },
    { title: "Completed Farms", value: completedFarms, icon: TrendingDown, color: "bg-gray-500", format: formatNumber },
    { title: "Total Area (luwang)", value: totalArea, icon: MapPin, color: "bg-purple-500", format: (v: number) => `${v.toFixed(2)}` },
  ];
  if (totalPitaks > 0) {
    cards.push({ title: "Total Plots", value: totalPitaks, icon: Activity, color: "bg-orange-500", format: formatNumber });
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

export default BukidSummaryCards;
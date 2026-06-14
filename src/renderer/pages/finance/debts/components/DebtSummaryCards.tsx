import React from "react";
import { Wallet, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface DebtSummaryCardsProps {
  totalDebts: number;
  totalBalance: number;
  overdueCount: number;
  averageInterest: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({
  totalDebts,
  totalBalance,
  overdueCount,
  averageInterest,
}) => {
  const cards = [
    { title: "Total Debts", value: totalDebts, icon: Wallet, color: "bg-blue-500", format: (v: number) => v.toString() },
    { title: "Total Balance", value: totalBalance, icon: TrendingDown, color: "bg-red-500", format: formatCurrency },
    { title: "Overdue Debts", value: overdueCount, icon: AlertCircle, color: "bg-orange-500", format: (v: number) => v.toString() },
    { title: "Avg Interest Rate", value: averageInterest, icon: TrendingUp, color: "bg-green-500", format: (v: number) => `${v.toFixed(1)}%` },
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

export default DebtSummaryCards;
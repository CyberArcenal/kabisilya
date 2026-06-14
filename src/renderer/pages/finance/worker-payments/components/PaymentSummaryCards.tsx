import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface PaymentSummaryCardsProps {
  totalCount: number;
  totalGross: number;
  totalNet: number;
  totalDebtDeducted: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  totalCount,
  totalGross,
  totalNet,
  totalDebtDeducted,
}) => {
  const cards = [
    {
      title: "Total Payments",
      value: totalCount,
      icon: Wallet,
      color: "bg-blue-500",
      valuePrefix: "",
      valueSuffix: "",
    },
    {
      title: "Total Gross Pay",
      value: totalGross,
      icon: DollarSign,
      color: "bg-green-500",
      valuePrefix: "₱",
      valueSuffix: "",
      formatter: formatCurrency,
    },
    {
      title: "Total Net Pay",
      value: totalNet,
      icon: TrendingUp,
      color: "bg-emerald-500",
      valuePrefix: "₱",
      valueSuffix: "",
      formatter: formatCurrency,
    },
    {
      title: "Total Debt Deducted",
      value: totalDebtDeducted,
      icon: TrendingDown,
      color: "bg-orange-500",
      valuePrefix: "₱",
      valueSuffix: "",
      formatter: formatCurrency,
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
              <p className="text-sm font-medium text-[var(--text-secondary)]">{card.title}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                {card.formatter ? card.formatter(card.value) : `${card.valuePrefix}${card.value.toLocaleString()}${card.valueSuffix}`}
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

export default PaymentSummaryCards;
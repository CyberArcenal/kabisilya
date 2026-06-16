import React from "react";
import { Users, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { SummaryCard } from "../../worker-payment-summary/components/SummaryCard"; // reuse existing

interface DebtSummaryCardsProps {
  totalWorkers: number;
  totalAmount: number;
  totalBalance: number;
  averageDebtPerWorker: number;
}

export const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({
  totalWorkers,
  totalAmount,
  totalBalance,
  averageDebtPerWorker,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Workers with Debts"
        value={totalWorkers}
        icon={Users}
        color="emerald"
      />
      <SummaryCard
        title="Total Debt Amount"
        value={totalAmount}
        icon={Wallet}
        color="blue"
        isCurrency
      />
      <SummaryCard
        title="Total Balance"
        value={totalBalance}
        icon={TrendingDown}
        color="orange"
        isCurrency
      />
      <SummaryCard
        title="Average Debt per Worker"
        value={averageDebtPerWorker}
        icon={TrendingUp}
        color="purple"
        isCurrency
      />
    </div>
  );
};
// src/renderer/pages/analytics/financial/index.tsx
import React from "react";
import { TrendingUp, DollarSign, CreditCard, AlertTriangle, Users } from "lucide-react";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { useFinancialReports } from "./hooks/useFinancialReports";
import KPICard from "./components/KPICard";
import RevenueTrendChart from "./components/RevenueTrendChart";
import DebtCollectionChart from "./components/DebtCollectionChart";
import TopPayersTable from "./components/TopPayersTable";
import OverdueDebtsTable from "./components/OverdueDebtsTable";

const FinancialReportsPage: React.FC = () => {
  const { loading, overview, revenueTrend, topPayers, overdueDebts, dateRange, updateDateRange } =
    useFinancialReports();

  const handleDateChange = (startDate: string, endDate: string) => {
    updateDateRange(startDate, endDate);
  };

  // Prepare data for DebtCollectionChart (mock from overview debtStatusBreakdown if available)
  const collectionData = overview?.debtStatusBreakdown?.map((item: any) => ({
    name: item.status,
    collected: item.totalAmount - item.totalBalance,
    remaining: item.totalBalance,
  })) || [];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading financial data..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Financial Reports</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Revenue, payments, debts, and collection analytics
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange(e.target.value, dateRange.endDate)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange(dateRange.startDate, e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Payments (Net)"
          value={overview?.payments?.currentMonth?.net || 0}
          change={overview?.payments?.growthRate}
          icon={<DollarSign className="w-5 h-5" />}
          color="#10b981"
        />
        <KPICard
          title="Total Outstanding Debts"
          value={overview?.debts?.totalBalance || 0}
          icon={<CreditCard className="w-5 h-5" />}
          color="#ef4444"
        />
        <KPICard
          title="Collection Rate"
          value={`${overview?.debts?.collectionRate.toFixed(2) || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#3b82f6"
        />
        <KPICard
          title="Total Debts Count"
          value={overview?.debts?.totalCount || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendChart data={revenueTrend} />
        <DebtCollectionChart data={collectionData} />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4">
          <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3">Top Payers (This Period)</h3>
          <TopPayersTable topPayers={topPayers} />
        </div>
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4">
          <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3">Overdue Debts</h3>
          <OverdueDebtsTable overdueDebts={overdueDebts} />
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsPage;
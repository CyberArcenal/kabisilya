// src/renderer/pages/analytics/workers/index.tsx
import React from "react";
import { Users, UserCheck, UserX, TrendingUp, DollarSign, Briefcase } from "lucide-react";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import Pagination from "../../../components/UI/Pagination";
import { useWorkerPerformance } from "./hooks/useWorkerPerformance";
import KPICard from "./components/KPICard";
import TopPerformersTable from "./components/TopPerformersTable";
import WorkerPerformanceTable from "./components/WorkerPerformanceTable";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const WorkerPerformancePage: React.FC = () => {
  const {
    loading,
    overview,
    topPerformers,
    performance,
    page,
    totalPages,
    totalItems,
    pageSize,
    dateRange,
    setPage,
    setPageSize,
    updateDateRange,
  } = useWorkerPerformance();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading worker performance data..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Worker Performance</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Productivity, assignments, and financial metrics by worker
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => updateDateRange(e.target.value, dateRange.endDate)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => updateDateRange(dateRange.startDate, e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Workers"
          value={overview?.summary.total || 0}
          icon={<Users className="w-5 h-5" />}
          color="#3b82f6"
        />
        <KPICard
          title="Active Workers"
          value={overview?.summary.active || 0}
          icon={<UserCheck className="w-5 h-5" />}
          color="#10b981"
        />
        <KPICard
          title="On Leave"
          value={overview?.summary.onLeave || 0}
          icon={<UserX className="w-5 h-5" />}
          color="#f59e0b"
        />
        <KPICard
          title="Active %"
          value={`${overview?.summary.activePercentage.toFixed(2) || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#8b5cf6"
        />
        <KPICard
          title="Total Debt"
          value={formatCurrency(overview?.financial.totalDebt || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          color="#ef4444"
        />
        <KPICard
          title="Avg Debt per Worker"
          value={formatCurrency(overview?.financial.averageDebt || 0)}
          icon={<Briefcase className="w-5 h-5" />}
          color="#ec4899"
        />
      </div>

      {/* Top Performers */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Top Performers (Productivity)</h3>
        <TopPerformersTable performers={topPerformers} />
      </div>

      {/* Worker Performance Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Worker Performance Details</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
          </p>
        </div>
        <WorkerPerformanceTable workers={performance} />
        <div className="px-6 py-4 border-t border-[var(--border-color)]">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={true}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkerPerformancePage;
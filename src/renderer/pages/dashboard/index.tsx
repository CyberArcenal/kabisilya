// src/renderer/pages/dashboard/index.tsx
import React, { Suspense, lazy, useMemo } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import KPIGrid from "./components/KPIGrid";
import QuickActions from "./components/QuickActions";
import RecentActivities from "./components/RecentActivities";
import TopWorkers from "./components/TopWorkers";
import UpcomingDebts from "./components/UpcomingDebts";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AssignmentsChart = lazy(() => import("./components/AssignmentsChart"));
const PaymentsVsDebtsChart = lazy(
  () => import("./components/PaymentsVsDebtsChart"),
);

const Dashboard: React.FC = () => {
  const { data, loading, error, refetch } = useDashboardData();
  const navigate = useNavigate();
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div className="dashboard-container space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] bg-clip-text text-transparent">
            Kabisilya Farm Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1 text-[var(--text-secondary)]">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm">{today}</span>
          </div>
        </div>
        <QuickActions />
      </div>

      {/* KPI Grid – responsive 6 cards */}
      <KPIGrid data={data} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <AssignmentsChart data={data.assignmentsPerMonth} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <PaymentsVsDebtsChart data={data.paymentsVsDebts} />
        </Suspense>
      </div>

      {/* Three‑column section – balanced, no giant block */}

      {/* Recent Activities (compact) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dashboard-bottom-cards">
        <RecentActivities activities={data.recentActivities} maxItems={5} />
        <TopWorkers
          workers={data.topWorkers}
          onViewAll={() => navigate("/analytics/workers")}
        />
        <UpcomingDebts
          debts={data.upcomingDebts}
          onViewAll={() => navigate("/finance/debts")}
        />
      </div>
    </div>
  );
};

// Skeletons (unchanged, but make sure they match new layout)
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 w-64 bg-[var(--card-hover-bg)] rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-[var(--card-bg)] rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-[var(--card-bg)] rounded-xl" />
      <div className="h-80 bg-[var(--card-bg)] rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-80 bg-[var(--card-bg)] rounded-xl" />
      <div className="h-80 bg-[var(--card-bg)] rounded-xl" />
      <div className="h-80 bg-[var(--card-bg)] rounded-xl" />
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="h-80 bg-[var(--card-bg)] rounded-xl animate-pulse" />
);

const DashboardError = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
    <AlertTriangle className="w-12 h-12 text-red-500" />
    <p className="text-[var(--text-primary)]">{error}</p>
    <button onClick={onRetry} className="btn-primary px-4 py-2 rounded-lg">
      Retry
    </button>
  </div>
);

export default Dashboard;

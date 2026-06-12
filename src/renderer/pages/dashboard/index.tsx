// src/renderer/pages/dashboard/index.tsx
import React from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import KPIGrid from "./components/KPIGrid";
import AssignmentsChart from "./components/AssignmentsChart";
import PaymentsVsDebtsChart from "./components/PaymentsVsDebtsChart";
import RecentActivities from "./components/RecentActivities";
import QuickActions from "./components/QuickActions";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { AlertTriangle } from "lucide-react";

const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-[var(--text-primary)]">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary px-4 py-2 rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header with quick actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Welcome back, here's what's happening on your farm.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* KPI Grid */}
      <KPIGrid data={data} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentsChart data={data.assignmentsPerMonth} />
        <PaymentsVsDebtsChart data={data.paymentsVsDebts} />
      </div>

      {/* Recent Activities */}
      <RecentActivities activities={data.recentActivities} />
    </div>
  );
};

export default Dashboard;
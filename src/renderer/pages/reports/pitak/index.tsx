// src/renderer/pages/analytics/pitak/index.tsx
import React from "react";
import { MapPin, Sprout, Wheat, TrendingUp, Users, LayoutGrid } from "lucide-react";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import Pagination from "../../../components/UI/Pagination";
import { usePitakProductivity } from "./hooks/usePitakProductivity";
import KPICard from "./components/KPICard";
import TopPerformersTable from "./components/TopPerformersTable";
import PitakPerformanceTable from "./components/PitakPerformanceTable";

const PitakProductivityPage: React.FC = () => {
  const { loading, overview, pitaks, topPerformers, page, totalPages, setPage } = usePitakProductivity();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading productivity data..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pitak Productivity</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Plot-level productivity, completion rates, and utilization analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Plots"
          value={overview?.totalPitaks || 0}
          icon={<MapPin className="w-5 h-5" />}
          color="#3b82f6"
        />
        <KPICard
          title="Active Plots"
          value={overview?.activePitaks || 0}
          icon={<Sprout className="w-5 h-5" />}
          color="#10b981"
        />
        <KPICard
          title="Harvested"
          value={overview?.harvestedPitaks || 0}
          icon={<Wheat className="w-5 h-5" />}
          color="#f59e0b"
        />
        <KPICard
          title="Avg Completion Rate"
          value={`${(overview?.averageCompletionRate || 0).toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#8b5cf6"
        />
        <KPICard
          title="Avg Utilization"
          value={`${(overview?.averageUtilization || 0).toFixed(1)}%`}
          icon={<Users className="w-5 h-5" />}
          color="#ec4899"
        />
        <KPICard
          title="Total Completed Luwang"
          value={overview?.totalCompletedLuwang || 0}
          icon={<LayoutGrid className="w-5 h-5" />}
          color="#14b8a6"
        />
      </div>

      {/* Top Performers */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Top Performing Plots</h3>
        <TopPerformersTable performers={topPerformers} />
      </div>

      {/* Pitak Performance Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">All Plots Performance</h3>
        </div>
        <PitakPerformanceTable pitaks={pitaks} />
        <div className="px-6 py-4 border-t border-[var(--border-color)]">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default PitakProductivityPage;
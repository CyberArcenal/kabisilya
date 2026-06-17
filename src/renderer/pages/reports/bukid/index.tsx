// src/renderer/pages/reports/bukid/index.tsx
import React from "react";
import { MapPin, Sprout, Wheat, Users } from "lucide-react";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import Pagination from "../../../components/UI/Pagination";
import KPICard from "./components/KPICard";
import ProductionChart from "./components/ProductionChart";
import PitakSummaryTable from "./components/PitakSummaryTable";
import { useBukidReports } from "./hooks/useBukidReports";

const BukidReportsPage: React.FC = () => {
  const {
    loading,
    kpis,
    productionData,
    pitakSummary,
    page,
    totalPages,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  } = useBukidReports();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Bukid Reports
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Farm performance and productivity analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Chart */}
      <ProductionChart data={productionData} />

      {/* Summary Table */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Pitak Summary
          </h3>
        </div>
        <PitakSummaryTable pitaks={pitakSummary} page={page} pageSize={pageSize} />
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

export default BukidReportsPage;
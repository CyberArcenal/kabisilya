// src/renderer/pages/finance/payment-history/index.tsx
import React, { useState } from "react";
import { Filter, X, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { usePaymentHistory } from "./hooks/usePaymentHistory";
import PaymentHistoryTable from "./components/PaymentHistoryTable";

const actionTypeOptions = [
  { value: "", label: "All Actions" },
  { value: "payment_recorded", label: "Payment Recorded" },
  { value: "debt_deduction", label: "Debt Deduction" },
  { value: "create", label: "Created" },
  { value: "update", label: "Updated" },
  { value: "status_change", label: "Status Changed" },
  { value: "adjustment", label: "Adjustment" },
];

const PaymentHistoryPage: React.FC = () => {
  const {
    history,
    loading,
    page,
    pageSize,
    totalCount,
    filters,
    setPage,
    setPageSize,
    setPaymentId,
    setActionType,
    setStartDate,
    setEndDate,
    resetFilters,
    refresh,
    exportToCSV,
  } = usePaymentHistory();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = !!(filters.paymentId || filters.actionType || filters.startDate || filters.endDate);

  // Calculate simple stats
  const totalRecords = totalCount;
  const dateRange =
    filters.startDate && filters.endDate
      ? `${new Date(filters.startDate).toLocaleDateString()} – ${new Date(filters.endDate).toLocaleDateString()}`
      : filters.startDate
      ? `From ${new Date(filters.startDate).toLocaleDateString()}`
      : filters.endDate
      ? `Until ${new Date(filters.endDate).toLocaleDateString()}`
      : "All time";

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Payment History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track changes to payment records (salary, debt deductions, adjustments)
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle Stats */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showStats ? "Hide summary" : "Show summary"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          {/* Export */}
          <button
            onClick={exportToCSV}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Total Records</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalRecords}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Date Range</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">{dateRange}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Latest Activity</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              {history.length > 0 ? new Date(history[0].changeDate).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="number"
              placeholder="Payment ID"
              value={filters.paymentId ?? ""}
              onChange={(e) => setPaymentId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <select
              value={filters.actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              {actionTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="date"
              placeholder="End date"
              value={filters.endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <PaymentHistoryTable history={history} />
          <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
            <div className="text-xs text-[var(--text-tertiary)]">
              Showing {history.length} of {totalCount} record{totalCount !== 1 ? "s" : ""}
            </div>
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 25, 50]}
              showPageSize
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
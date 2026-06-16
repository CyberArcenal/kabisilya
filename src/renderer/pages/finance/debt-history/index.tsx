// src/renderer/pages/finance/debt-history/index.tsx
import React, { useState } from "react";
import { Filter, X, RefreshCw, Download, Eye, EyeOff } from "lucide-react";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { useDebtHistory } from "./hooks/useDebtHistory";
import DebtHistoryTable from "./components/DebtHistoryTable";

const transactionTypeOptions = [
  { value: "", label: "All Types" },
  { value: "payment", label: "Payment" },
  { value: "adjustment", label: "Adjustment" },
  { value: "forgiveness", label: "Forgiveness" },
  { value: "interest", label: "Interest" },
];

const DebtHistoryPage: React.FC = () => {
  const {
    history,
    loading,
    page,
    pageSize,
    totalCount,
    filters,
    setPage,
    setPageSize,
    setDebtId,
    setTransactionType,
    setStartDate,
    setEndDate,
    setMinAmount,
    setMaxAmount,
    resetFilters,
    refresh,
    exportToCSV,
  } = useDebtHistory();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = !!(
    filters.debtId ||
    filters.transactionType ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined
  );

  // Summary stats
  const totalRecords = totalCount;
  const totalAmountPaid = history.reduce((sum, item) => sum + item.amountPaid, 0);
  const avgPayment = history.length > 0 ? totalAmountPaid / history.length : 0;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Debt History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track all debt-related transactions (payments, adjustments, forgiveness, interest)
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
            <p className="text-sm text-[var(--text-secondary)]">Total Amount Paid</p>
            <p className="text-2xl font-bold text-emerald-600">
              ₱{totalAmountPaid.toFixed(2)}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Average Payment</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              ₱{avgPayment.toFixed(2)}
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
              placeholder="Debt ID"
              value={filters.debtId ?? ""}
              onChange={(e) => setDebtId(e.target.value ? parseInt(e.target.value) : undefined)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <select
              value={filters.transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              {transactionTypeOptions.map((opt) => (
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
            <input
              type="number"
              step="0.01"
              placeholder="Min amount"
              value={filters.minAmount ?? ""}
              onChange={(e) => setMinAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Max amount"
              value={filters.maxAmount ?? ""}
              onChange={(e) => setMaxAmount(e.target.value ? parseFloat(e.target.value) : undefined)}
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
          <DebtHistoryTable history={history} />
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

export default DebtHistoryPage;
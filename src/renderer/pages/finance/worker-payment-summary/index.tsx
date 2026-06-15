// src/renderer/pages/finance/worker-payment-summary/index.tsx
import React, { useState } from "react";
import {
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { useWorkerPaymentSummary } from "./hooks";
import { WorkerPaymentTable } from "./components/WorkerPaymentTable";
import { RecordWorkerPaymentModal } from "./components/RecordWorkerPaymentModal";
import { ViewWorkerPaymentsModal } from "./components/ViewWorkerPaymentsModal";
import { SummaryCard } from "./components/SummaryCard";
import { EmptyState } from "./components/EmptyState";


const WorkerPaymentSummaryPage: React.FC = () => {
  const {
    workers,
    loading,
    totalCount,
    totalPages,
    filters,
    setSearch,
    setSessionId,
    setStartDate,
    setEndDate,
    resetFilters,
    page,
    limit,
    setPage,
    setLimit,
    sortBy,
    sortOrder,
    setSort,
    viewModal,
    recordModal,
    onViewWorker,
    onRecordPayment,
    onDeleteWorker,
    onBulkDelete,
    onBulkStatusChange,
    selectedWorkerIds,
    setSelectedWorkerIds,
    refresh,
  } = useWorkerPaymentSummary();

  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Calculate totals from current workers (already filtered)
  const totals = {
    workers: totalCount,
    totalGross: workers.reduce((sum, w) => sum + w.totalGross, 0),
    totalNet: workers.reduce((sum, w) => sum + w.totalNet, 0),
    totalDebt: workers.reduce((sum, w) => sum + w.totalDebtBalance, 0),
  };

  const exportToCSV = () => {
    // same as before but with more fields
    const headers = [
      "Worker ID", "Worker Name", "Total Gross", "Total Debt Deduction",
      "Total Net", "Total Paid", "Payment Count", "Pending Payments", "Outstanding Debt",
    ];
    const rows = workers.map(w => [
      w.workerId, w.workerName, w.totalGross, w.totalDebtDeduction,
      w.totalNet, w.totalPaid, w.paymentCount,
      w.totalOutstandingPayments, w.totalDebtBalance,
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `worker_payment_summary_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header with gradient */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            Worker Payment Summary
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            One‑click payment for all pending payments and debts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showStats ? "Hide summary cards" : "Show summary cards"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title="Export summary to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Workers"
            value={totals.workers}
            icon={Users}
            color="emerald"
          />
          <SummaryCard
            title="Total Gross Pay"
            value={totals.totalGross}
            icon={TrendingUp}
            color="blue"
            isCurrency
          />
          <SummaryCard
            title="Total Net Pay"
            value={totals.totalNet}
            icon={Wallet}
            color="green"
            isCurrency
          />
          <SummaryCard
            title="Total Outstanding Debt"
            value={totals.totalDebt}
            icon={TrendingDown}
            color="orange"
            isCurrency
          />
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-5 border border-[var(--border-color)] shadow-sm transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search worker name..."
              value={filters.search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <SessionSelect
              value={filters.sessionId || null}
              onChange={(id) => {
                setSessionId(id || undefined);
                setPage(1);
              }}
              placeholder="All sessions"
            />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          {(filters.search || filters.sessionId || filters.startDate || filters.endDate) && (
            <div className="flex justify-end mt-3">
              <button
                onClick={() => {
                  resetFilters();
                  setPage(1);
                }}
                className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1"
              >
                <Filter className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedWorkerIds.length > 0 && (
        <div className="bg-[var(--primary-color)]/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm border border-[var(--primary-color)]/30 animate-slideDown">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
              {selectedWorkerIds.length} worker{selectedWorkerIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => onBulkStatusChange(selectedWorkerIds, "completed")}>
              ✓ Mark Completed
            </Button>
            <Button variant="warning" size="sm" onClick={() => onBulkStatusChange(selectedWorkerIds, "cancelled")}>
              ✗ Cancel All
            </Button>
            <Button variant="danger" size="sm" onClick={() => onBulkDelete(selectedWorkerIds)}>
              🗑 Delete Payments
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedWorkerIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Table or Loading / Empty */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-96 animate-pulse bg-[var(--card-secondary-bg)] rounded-xl" />
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          title="No workers found"
          description="Try adjusting your filters or create a new payment."
          icon={Users}
          onReset={resetFilters}
        />
      ) : (
        <>
          <WorkerPaymentTable
            workers={workers}
            onViewWorker={onViewWorker}
            onRecordPayment={onRecordPayment}
            onDeleteWorker={onDeleteWorker}
            selectedIds={selectedWorkerIds}
            onSelectRow={(id, checked) => {
              setSelectedWorkerIds(prev =>
                checked ? [...prev, id] : prev.filter(i => i !== id)
              );
            }}
            onSelectAll={(checked) => {
              setSelectedWorkerIds(checked ? workers.map(w => w.workerId) : []);
            }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={setSort}
          />
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalItems={totalCount}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
              pageSizeOptions={[10, 25, 50, 100]}
              showPageSize
            />
          </div>
        </>
      )}

      {/* Modals */}
      <ViewWorkerPaymentsModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        worker={viewModal.worker}
        onRefresh={refresh}
      />
      <RecordWorkerPaymentModal
        isOpen={recordModal.isOpen}
        onClose={recordModal.close}
        workerId={recordModal.worker?.workerId || 0}
        workerName={recordModal.worker?.workerName || ""}
        totalOutstandingPayments={recordModal.worker?.totalOutstandingPayments || 0}
        onSuccess={refresh}
      />
    </div>
  );
};

export default WorkerPaymentSummaryPage;
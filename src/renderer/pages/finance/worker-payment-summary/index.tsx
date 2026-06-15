// src/renderer/pages/finance/worker-payment-summary/index.tsx
import React, { useState } from "react";
import { Filter, RefreshCw, Eye, EyeOff, Download } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { useWorkerPaymentSummary } from "./hooks";
import { WorkerPaymentTable } from "./components/WorkerPaymentTable";
import { RecordWorkerPaymentModal } from "./components/RecordWorkerPaymentModal";
import { ViewWorkerPaymentsModal } from "./components/ViewWorkerPaymentsModal";

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
  const [showStats, setShowStats] = useState(false);

  // Export all workers summary to CSV
  const exportToCSV = () => {
    const headers = [
      "Worker ID",
      "Worker Name",
      "Total Gross",
      "Total Debt Deduction",
      "Total Net",
      "Total Paid",
      "Payment Count",
    ];
    const rows = workers.map(w => [
      w.workerId,
      w.workerName,
      w.totalGross,
      w.totalDebtDeduction,
      w.totalNet,
      w.totalPaid,
      w.paymentCount,
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
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Worker Payment Summary
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            One‑click payment for all pending payments and debts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary cards" : "Show summary cards"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Export summary to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards (optional) */}
      {showStats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border">
            <p className="text-sm text-[var(--text-secondary)]">Total Workers</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border">
            <p className="text-sm text-[var(--text-secondary)]">Total Gross</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
                workers.reduce((s, w) => s + w.totalGross, 0)
              )}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border">
            <p className="text-sm text-[var(--text-secondary)]">Total Net</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
                workers.reduce((s, w) => s + w.totalNet, 0)
              )}
            </p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl p-4 border">
            <p className="text-sm text-[var(--text-secondary)]">Total Debt Deducted</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
                workers.reduce((s, w) => s + w.totalDebtDeduction, 0)
              )}
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search worker name..."
              value={filters.search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border"
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
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          {(filters.search || filters.sessionId || filters.startDate || filters.endDate) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  resetFilters();
                  setPage(1);
                }}
                className="text-xs text-[var(--primary-color)] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedWorkerIds.length > 0 && (
        <div className="bg-[var(--primary-color)]/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">{selectedWorkerIds.length} worker(s) selected</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkStatusChange(selectedWorkerIds, "completed")}
            >
              Mark Completed
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onBulkStatusChange(selectedWorkerIds, "cancelled")}
            >
              Cancel All
            </Button>
            <Button variant="danger" size="sm" onClick={() => onBulkDelete(selectedWorkerIds)}>
              Delete All Payments
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedWorkerIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
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
          <Pagination
            currentPage={page}
            totalItems={totalCount}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={true}
          />
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
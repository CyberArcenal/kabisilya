import React, { useState } from "react";
import { Filter, RefreshCw, Eye, EyeOff, Download, Users } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { useDebtSummary } from "./hooks";
import { WorkerDebtSummaryTable } from "./components/WorkerDebtSummaryTable";
import { ViewWorkerDebtsModal } from "./components/ViewWorkerDebtsModal";
import { DebtSummaryCards } from "./components/DebtSummaryCards";
import BulkActionsBar from "./components/BulkActionsBar";
import { EmptyState } from "../worker-payment-summary/components/EmptyState";
import RecordPaymentModal from "../debts/components/RecordPaymentModal";
import { PayAllDebtsModal } from "./components/PayAllDebtsModal";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "overdue", label: "Overdue" },
  { value: "settled", label: "Settled" },
];

const DebtSummaryPage: React.FC = () => {
  const {
    workers,
    loading,
    totalCount,
    totalPages,
    filters,
    setSearch,
    setSessionId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    resetFilters,
    page,
    limit,
    setPage,
    setLimit,
    sortBy,
    sortOrder,
    setSort,
    viewModal,
    payAllModal,
    onPayAllDebts,
    recordModal,
    onViewWorker,
    onRecordPayment,
    onDeleteWorker,
    onBulkDelete,
    onBulkStatusChange,
    selectedWorkerIds,
    setSelectedWorkerIds,
    refresh,
  } = useDebtSummary();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Calculate totals
  const totals = {
    workers: totalCount,
    totalAmount: workers.reduce((sum, w) => sum + w.totalAmount, 0),
    totalBalance: workers.reduce((sum, w) => sum + w.totalBalance, 0),
    averageDebt:
      totalCount > 0
        ? workers.reduce((sum, w) => sum + w.totalBalance, 0) / totalCount
        : 0,
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Worker ID",
      "Worker Name",
      "Debt Count",
      "Total Amount",
      "Total Balance",
      "Status Breakdown",
    ];
    const rows = workers.map((w) => [
      w.workerId,
      w.workerName,
      w.debtCount,
      w.totalAmount,
      w.totalBalance,
      Object.entries(w.statusBreakdown)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; "),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debt_summary_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
            Debt Summary
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Aggregated view of worker debts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showStats ? "Hide summary cards" : "Show summary cards"}
          >
            {showStats ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
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
        <DebtSummaryCards
          totalWorkers={totals.workers}
          totalAmount={totals.totalAmount}
          totalBalance={totals.totalBalance}
          averageDebtPerWorker={totals.averageDebt}
        />
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
            <select
              value={filters.status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Due date from"
              value={filters.dueDateStart}
              onChange={(e) => {
                setDueDateStart(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="date"
              placeholder="Due date to"
              value={filters.dueDateEnd}
              onChange={(e) => {
                setDueDateEnd(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min amount"
                value={filters.minAmount ?? ""}
                onChange={(e) =>
                  setMinAmount(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="number"
                placeholder="Max amount"
                value={filters.maxAmount ?? ""}
                onChange={(e) =>
                  setMaxAmount(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
          {(filters.search ||
            filters.sessionId ||
            filters.status ||
            filters.dueDateStart ||
            filters.dueDateEnd ||
            filters.minAmount !== undefined ||
            filters.maxAmount !== undefined) && (
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
        <BulkActionsBar
          selectedCount={selectedWorkerIds.length}
          onStatusChange={(newStatus) =>
            onBulkStatusChange(selectedWorkerIds, newStatus)
          }
          onDelete={() => onBulkDelete(selectedWorkerIds)}
          onExport={exportToCSV} // or a separate function to export selected
          onClearSelection={() => setSelectedWorkerIds([])}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--primary-color)]" />
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          title="No workers with debts"
          description="Try adjusting your filters or create a new debt."
          icon={Users}
          onReset={resetFilters}
        />
      ) : (
        <>
          <WorkerDebtSummaryTable
            workers={workers}
            onViewWorker={onViewWorker}
            onRecordPayment={onRecordPayment}
            onPayAllDebts={onPayAllDebts}
            onDeleteWorker={onDeleteWorker}
            selectedIds={selectedWorkerIds}
            onSelectRow={(id, checked) => {
              setSelectedWorkerIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id),
              );
            }}
            onSelectAll={(checked) => {
              setSelectedWorkerIds(
                checked ? workers.map((w) => w.workerId) : [],
              );
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
      <ViewWorkerDebtsModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        worker={viewModal.worker}
        onRecordPayment={onRecordPayment}
        onRefresh={refresh}
      />

      {/* Record Payment Modal (from debt management) */}
      {recordModal.isOpen && recordModal.debt && (
        <RecordPaymentModal
          isOpen={recordModal.isOpen}
          onClose={recordModal.close}
          debtId={recordModal.debt.id}
          workerName={recordModal.workerName}
          currentBalance={recordModal.debt.balance}
          onSuccess={() => {
            refresh();
            recordModal.close();
          }}
          onPay={async (
            debtId,
            amount,
            paymentMethod,
            referenceNumber,
            notes,
          ) => {
            await recordModal.onSubmit({
              debtId,
              amount,
              paymentMethod,
              referenceNumber,
              notes,
            });
          }}
        />
      )}
      {payAllModal.isOpen && payAllModal.worker && (
        <PayAllDebtsModal
          isOpen={payAllModal.isOpen}
          onClose={payAllModal.close}
          workerId={payAllModal.worker.workerId}
          workerName={payAllModal.worker.workerName}
          totalDebtBalance={payAllModal.totalBalance}
          onPay={async (data) => {
            await payAllModal.onSubmit(data);
          }}
        />
      )}
    </div>
  );
};

export default DebtSummaryPage;

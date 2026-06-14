// src/renderer/pages/finance/worker-payments/index.tsx
import React, { useState } from "react";
import { Filter, X, RefreshCw, Eye, EyeOff, Download } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import WorkerSelect from "../../../components/Selects/WorkerSelect";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { usePayments } from "./hooks/usePayments";
import PaymentTable from "./components/PaymentTable";
import CreatePaymentModal from "./components/CreatePaymentModal";
import ViewPaymentModal from "./components/ViewPaymentModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import PaymentSummaryCards from "./components/PaymentSummaryCards";
import BulkActionsBar from "./components/BulkActionsBar";
import paymentAPI from "../../../api/core/payment";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const WorkerPaymentsPage: React.FC = () => {
  const {
    payments,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedPayment,
    viewModal,
    formModal,
    recordPayment,
    workerOutstandingDebt,
    recordModal,
    totalGross,
    totalNet,
    totalDebtDeduction,
    limit,
    sortBy,
    sortOrder,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    exportSelected,
    setSort,
    setLimit,
    handleRecordPayment,
    handleCancelPayment,
    handleConfirmRecord,
    setPage,
    setSearch,
    setWorkerId,
    setSessionId,
    setStatus,
    setStartDate,
    setEndDate,
    handleDelete,
    handleView,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch,
  } = usePayments();

  // Toggle states
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  const hasFilters = !!(
    filters.search ||
    filters.workerId ||
    filters.sessionId ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  );

  // Export all payments matching current filters
  const exportAllToCSV = async () => {
    setExportingAll(true);
    try {
      const params: any = {
        page: 1,
        limit: 10000, // fetch up to 10000 records
        sortBy,
        sortOrder,
        search: filters.search,
        workerId: filters.workerId,
        sessionId: filters.sessionId,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };
      const res = await paymentAPI.getAll(params);
      if (!res.status) throw new Error(res.message);
      const allPayments = res.data.items;

      if (allPayments.length === 0) {
        alert("No payments to export.");
        return;
      }

      const headers = [
        "ID",
        "Worker",
        "Pitak",
        "Session",
        "Gross Pay",
        "Manual Deduction",
        "Debt Deduction",
        "Net Pay",
        "Amount Paid",
        "Last Payment Date",
        "Status",
        "Payment Date",
        "Reference Number",
        "Notes",
      ];
      const rows = allPayments.map((p) => [
        p.id,
        p.worker?.name || "",
        p.pitak?.location || "",
        p.session?.name || "",
        p.grossPay,
        p.manualDeduction || 0,
        p.totalDebtDeduction || 0,
        p.netPay,
        p.amountPaid || 0,
        p.lastPaymentDate ? new Date(p.lastPaymentDate).toLocaleDateString() : "",
        p.status,
        p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "",
        p.referenceNumber || "",
        p.notes || "",
      ]);

      const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all_payments_${new Date().toISOString().slice(0, 19)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export payments.");
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Worker Payments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage payments to workers
          </p>
        </div>
        {/* Control buttons */}
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
            onClick={exportAllToCSV}
            disabled={exportingAll}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Export all payments (current filters)"
          >
            {exportingAll ? (
              <div className="animate-spin h-4 w-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors text-[var(--text-secondary)] disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards (togglable) */}
      {showStats && (
        <PaymentSummaryCards
          totalCount={totalCount}
          totalGross={totalGross}
          totalNet={totalNet}
          totalDebtDeducted={totalDebtDeduction}
        />
      )}

      {/* Filters Bar (togglable) */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <Filter className="w-4 h-4" /> Filters
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search worker or pitak..."
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
            <WorkerSelect
              value={filters.workerId || null}
              onChange={(id) => {
                setWorkerId(id || undefined);
                setPage(1);
              }}
              placeholder="All workers"
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
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
              placeholder="Start date"
              value={filters.startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          {hasFilters && (
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onStatusChange={(newStatus) => bulkStatusChange(selectedIds, newStatus)}
          onDelete={() => bulkDelete(selectedIds)}
          onExport={exportSelected}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <PaymentTable
            payments={payments}
            onView={handleView}
            onDelete={handleDelete}
            onRecordPayment={handleRecordPayment}
            onCancelPayment={handleCancelPayment}
            onSort={setSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            selectedIds={selectedIds}
            onSelectRow={(id, checked) => {
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id)
              );
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? payments.map((p) => p.id) : []);
            }}
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
      <ViewPaymentModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        payment={selectedPayment}
      />
      <CreatePaymentModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={null}
      />
      <RecordPaymentModal
        isOpen={recordModal.isOpen}
        onClose={recordModal.close}
        paymentId={recordPayment?.id || 0}
        workerName={recordPayment?.worker?.name || ""}
        grossPay={recordPayment?.grossPay || 0}
        currentAmountPaid={recordPayment?.amountPaid || 0}
        outstandingDebt={workerOutstandingDebt}
        onRecord={handleConfirmRecord}
      />
    </div>
  );
};

export default WorkerPaymentsPage;
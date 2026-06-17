// src/renderer/pages/finance/debts/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Filter,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import WorkerSelect from "../../../components/Selects/WorkerSelect";
import { useDebts } from "./hooks/useDebts";
import DebtTable from "./components/DebtTable";
import CreateDebtModal from "./components/CreateDebtModal";
import ViewDebtModal from "./components/ViewDebtModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import DebtSummaryCards from "./components/DebtSummaryCards";
import BulkActionsBar from "./components/BulkActionsBar";
import { usePagination } from "../../../contexts/PaginationContext";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "overdue", label: "Overdue" },
  { value: "settled", label: "Settled" },
];

const DebtManagementPage: React.FC = () => {
  const {
    debts,
    loading,
    page,
    totalPages,
    statsTotal,
    totalCount,
    filters,
    selectedDebt,
    viewModal,
    formModal,
    paymentDebt,
    paymentModal,
    totalBalance,
    overdueCount,
    averageInterest,
    limit,
    sortBy,
    sortOrder,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    handleRecordPayment,
    handleConfirmPayment,
    handleCancelDebt,
    setPage,
    setSearch,
    setWorkerId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    setLimit,
    setSort,
    handleDelete,
    handleView,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch,
    exportToCSV,
  } = useDebts();

  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = !!(
    filters.search ||
    filters.workerId ||
    filters.status ||
    filters.dueDateStart ||
    filters.dueDateEnd ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined
  );

    const { setPagination, clearPagination } = usePagination();
  
    // Stable callbacks – they depend on setPage/setLimit which should be stable
    const handlePageChange = useCallback(
      (newPage: number) => {
        setPage(newPage);
      },
      [setPage],
    );
  
    const handlePageSizeChange = useCallback(
      (newSize: number) => {
        setLimit(newSize);
        setPage(1);
      },
      [setLimit, setPage],
    );
  
    // Store the latest handlers in a ref so the effect can always use the current ones
    const handlersRef = useRef({
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    });
    useEffect(() => {
      handlersRef.current = {
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
      };
    }, [handlePageChange, handlePageSizeChange]);
  
    // Track previous primitive values to avoid unnecessary updates
    const prevPageRef = useRef(page);
    const prevTotalRef = useRef(totalCount);
    const prevLimitRef = useRef(limit);
  
    // Effect that only runs when primitive pagination data changes
    useEffect(() => {
      const pageChanged = prevPageRef.current !== page;
      const totalChanged = prevTotalRef.current !== totalCount;
      const limitChanged = prevLimitRef.current !== limit;
  
      if (pageChanged || totalChanged || limitChanged) {
        // Update refs
        prevPageRef.current = page;
        prevTotalRef.current = totalCount;
        prevLimitRef.current = limit;
  
        // Call setPagination with current primitives and the latest handlers from ref
        setPagination({
          currentPage: page,
          totalItems: totalCount,
          pageSize: limit,
          onPageChange: handlersRef.current.onPageChange,
          onPageSizeChange: handlersRef.current.onPageSizeChange,
          pageSizeOptions: [10, 25, 50, 100],
          showPageSize: true,
        });
      }
    }, [page, totalCount, limit, setPagination]); // Only these dependencies matter
  
    // Clear pagination on unmount
    useEffect(() => {
      return () => clearPagination();
    }, [clearPagination]);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Debt Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage worker debts and collections
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
            title="Export all debts (current filters)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleAddNew}>
            Create Debt
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {showStats && (
        <DebtSummaryCards
          totalDebts={statsTotal}
          totalBalance={totalBalance}
          overdueCount={overdueCount}
          averageInterest={averageInterest}
        />
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search worker or reason..."
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
              placeholder="Due date from"
              value={filters.dueDateStart}
              onChange={(e) => {
                setDueDateStart(e.target.value);
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
              placeholder="Due date to"
              value={filters.dueDateEnd}
              onChange={(e) => {
                setDueDateEnd(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                  setMinAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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
                  setMaxAmount(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
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
          onExport={bulkExport}
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
          <DebtTable
            debts={debts}
            onView={handleView}
            onDelete={handleDelete}
            onCancel={handleCancelDebt}
            onRecordPayment={handleRecordPayment}
            onSort={setSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            selectedIds={selectedIds}
            onSelectRow={(id, checked) => {
              setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? debts.map((d) => d.id) : []);
            }}
          />
        </>
      )}

      {/* Modals */}
      <ViewDebtModal isOpen={viewModal.isOpen} onClose={viewModal.close} debt={selectedDebt} />
      <CreateDebtModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={null}
      />
      <RecordPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={paymentModal.close}
        debtId={paymentDebt?.id || 0}
        workerName={paymentDebt?.worker?.name || ""}
        currentBalance={paymentDebt?.balance || 0}
        onSuccess={() => {}}
        onPay={handleConfirmPayment}
      />
    </div>
  );
};

export default DebtManagementPage;
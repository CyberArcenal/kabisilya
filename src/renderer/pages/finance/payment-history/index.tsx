// src/renderer/pages/finance/payment-history/index.tsx
import React from "react";
import { Filter, X } from "lucide-react";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { usePaymentHistory } from "./hooks/usePaymentHistory";
import PaymentHistoryTable from "./components/PaymentHistoryTable";

const actionTypeOptions = [
  { value: "", label: "All Actions" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "partially_paid", label: "Partially Paid" },
];

const PaymentHistoryPage: React.FC = () => {
  const {
    history,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    setPage,
    setPaymentId,
    setActionType,
    setStartDate,
    setEndDate,
    resetFilters,
  } = usePaymentHistory();

  const hasFilters = !!(filters.paymentId || filters.actionType || filters.startDate || filters.endDate);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Payment History</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Track changes to payment records</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="number"
            placeholder="Payment ID"
            value={filters.paymentId ?? ""}
            onChange={(e) => setPaymentId(e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
          <select
            value={filters.actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          >
            {actionTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Start date"
            value={filters.startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
          <input
            type="date"
            placeholder="End date"
            value={filters.endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        {hasFilters && (
          <div className="flex justify-end">
            <button onClick={resetFilters} className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <PaymentHistoryTable history={history} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} record{totalCount !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
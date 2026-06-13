// src/renderer/pages/finance/worker-payments/index.tsx
import React from "react";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import WorkerSelect from "../../../components/Selects/WorkerSelect";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { usePayments } from "./hooks/usePayments";
import PaymentTable from "./components/PaymentTable";
import CreatePaymentModal from "./components/CreatePaymentModal";
import ViewPaymentModal from "./components/ViewPaymentModal";
import ChangePaymentStatusModal from "./components/ChangePaymentStatusModal";

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
    editingPayment,
    viewModal,
    formModal,
    statusChangePayment,
    statusModal,
    setPage,
    setSearch,
    setWorkerId,
    setSessionId,
    setStatus,
    setStartDate,
    setEndDate,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
  } = usePayments();

  const hasFilters = !!(filters.search || filters.workerId || filters.sessionId || filters.status || filters.startDate || filters.endDate);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Worker Payments</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage payments to workers</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>
          Create Payment
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search worker or pitak..."
            value={filters.search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
          <WorkerSelect
            value={filters.workerId || null}
            onChange={(id) => { setWorkerId(id || undefined); setPage(1); }}
            placeholder="All workers"
          />
          <SessionSelect
            value={filters.sessionId || null}
            onChange={(id) => { setSessionId(id || undefined); setPage(1); }}
            placeholder="All sessions"
          />
          <select
            value={filters.status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="date"
            placeholder="Start date"
            value={filters.startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
          <input
            type="date"
            placeholder="End date"
            value={filters.endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
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
          <PaymentTable
            payments={payments}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} payment{totalCount !== 1 ? 's' : ''}
          </div>
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
        initialData={editingPayment}
      />
      <ChangePaymentStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        paymentInfo={
          statusChangePayment
            ? `Payment #${statusChangePayment.id} - ${statusChangePayment.worker?.name || "Unknown"}`
            : ""
        }
        currentStatus={statusChangePayment?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default WorkerPaymentsPage;
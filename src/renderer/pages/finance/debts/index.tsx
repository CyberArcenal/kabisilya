// src/renderer/pages/finance/debts/index.tsx
import React from "react";
import { Plus, Filter, X } from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import WorkerSelect from "../../../components/Selects/WorkerSelect";
import { useDebts } from "./hooks/useDebts";
import DebtTable from "./components/DebtTable";
import CreateDebtModal from "./components/CreateDebtModal";
import ViewDebtModal from "./components/ViewDebtModal";
import ChangeDebtStatusModal from "./components/ChangeDebtStatusModal";
import RecordPaymentModal from "./components/RecordPaymentModal";

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
    totalCount,
    filters,
    selectedDebt,
    editingDebt,
    viewModal,
    formModal,
    statusChangeDebt,
    statusModal,
    paymentDebt,
    paymentModal,
    handleRecordPayment,
    handleConfirmPayment,
    setPage,
    setSearch,
    setWorkerId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
  } = useDebts();

  const hasFilters = !!(
    filters.search ||
    filters.workerId ||
    filters.status ||
    filters.dueDateStart ||
    filters.dueDateEnd ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined
  );

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
        <Button variant="primary" size="md" icon={Plus} onClick={handleAddNew}>
          Create Debt
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
                setMinAmount(
                  e.target.value ? parseFloat(e.target.value) : undefined,
                )
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
                setMaxAmount(
                  e.target.value ? parseFloat(e.target.value) : undefined,
                )
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
            onRecordPayment={handleRecordPayment}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} debt{totalCount !== 1 ? "s" : ""}
          </div>
        </>
      )}

      {/* Modals */}
      <ViewDebtModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        debt={selectedDebt}
      />
 <CreateDebtModal
  key={editingDebt?.id || 'new'}
  isOpen={formModal.isOpen}
  onClose={formModal.close}
  onSuccess={handleFormSuccess}
  initialData={editingDebt}
/>
      <ChangeDebtStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        debtInfo={
          statusChangeDebt
            ? `Debt #${statusChangeDebt.id} - ${statusChangeDebt.worker?.name || "Unknown"}`
            : ""
        }
        currentStatus={statusChangeDebt?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
      <RecordPaymentModal
        isOpen={paymentModal.isOpen}
        onClose={paymentModal.close}
        debtId={paymentDebt?.id || 0}
        workerName={paymentDebt?.worker?.name || ""}
        currentBalance={paymentDebt?.balance || 0}
        onSuccess={() => {}} // optional, handleConfirmPayment already refreshes
        onPay={handleConfirmPayment}
      />
    </div>
  );
};

export default DebtManagementPage;

import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Pagination from "../../../../components/UI/Pagination";
import Button from "../../../../components/UI/Button";
import { CreditCard, Trash2, XCircle } from "lucide-react";
import type { WorkerDebtSummary } from "../utils/aggregateDebts";
import type { Debt } from "../../../../api/core/debt";
import { dialogs } from "../../../../utils/dialogs";
import debtAPI from "../../../../api/core/debt";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerDebtSummary | null;
  onRecordPayment: (debt: Debt, workerName: string) => void;
  onRefresh: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  partially_paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  overdue: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  settled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const bg = statusColors[status]?.split(" ")[0] || "bg-gray-100";
  const text = statusColors[status]?.split(" ")[1] || "text-gray-800";
  return <span className={`px-2 py-0.5 rounded-full text-xs ${bg} ${text}`}>{status}</span>;
};

export const ViewWorkerDebtsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  worker,
  onRecordPayment,
  onRefresh,
}) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (isOpen && worker) {
      setDebts(worker.debts);
      setPage(1);
    }
  }, [isOpen, worker]);

  if (!worker) return null;

  const totalItems = debts.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  const paginatedDebts = debts.slice(start, start + limit);

  const handleCancelDebt = async (debtId: number) => {
    const confirmed = await dialogs.confirm({
      title: "Cancel Debt",
      message: "Are you sure you want to cancel this debt?",
      confirmText: "Cancel Debt",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await debtAPI.updateStatus(debtId, "cancelled");
      // Update local state: remove the cancelled debt or update its status
      setDebts((prev) =>
        prev.map((d) =>
          d.id === debtId ? { ...d, status: "cancelled" } : d
        )
      );
      // Also refresh the parent to keep consistency
      onRefresh();
    } catch (error) {
      console.error("Failed to cancel debt", error);
      dialogs.error("Failed to cancel debt. Please try again.");
    }
  };

  const handleDeleteDebt = async (debtId: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Debt",
      message: "Are you sure you want to delete this debt?",
      confirmText: "Delete",
      icon: "danger",
    });
    if (!confirmed) return;
    try {
      await debtAPI.delete(debtId);
      // Remove from local state
      setDebts((prev) => prev.filter((d) => d.id !== debtId));
      onRefresh();
    } catch (error) {
      console.error("Failed to delete debt", error);
      dialogs.error("Failed to delete debt. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Debts of ${worker.workerName}`} size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">ID</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Amount</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Balance</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Due Date</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Status</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Interest</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Reason</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDebts.map((debt) => (
              <tr key={debt.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
                <td className="py-2 px-3 text-[var(--text-primary)]">#{debt.id}</td>
                <td className="py-2 px-3 text-right text-[var(--text-secondary)]">{formatCurrency(debt.amount)}</td>
                <td className="py-2 px-3 text-right font-medium text-red-500">{formatCurrency(debt.balance)}</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">
                  {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="py-2 px-3"><StatusBadge status={debt.status} /></td>
                <td className="py-2 px-3 text-right text-[var(--text-secondary)]">{debt.interestRate}%</td>
                <td className="py-2 px-3 text-[var(--text-secondary)] max-w-xs truncate">{debt.reason || "—"}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onRecordPayment(debt, worker.workerName)}
                      className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600"
                      title="Record Payment"
                      disabled={debt.balance <= 0 || debt.status === "paid" || debt.status === "cancelled" || debt.status === "settled"}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancelDebt(debt.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                      title="Cancel Debt"
                      disabled={debt.status === "paid" || debt.status === "cancelled" || debt.status === "settled"}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                      title="Delete Debt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedDebts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[var(--text-tertiary)]">
                  No debts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalItems={totalItems}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            pageSizeOptions={[5, 10, 25, 50]}
            showPageSize={true}
          />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};
// src/renderer/pages/finance/worker-payment-summary/components/ViewWorkerPaymentsModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Pagination from "../../../../components/UI/Pagination";
import type { WorkerPaymentSummary } from "../utils/aggregatePayments";
import type { Payment } from "../../../../api/core/payment";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerPaymentSummary | null;
  onRefresh: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  partially_paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const ViewWorkerPaymentsModal: React.FC<Props> = ({ isOpen, onClose, worker, onRefresh }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (isOpen && worker) {
      setPayments(worker.payments);
      setPage(1);
    }
  }, [isOpen, worker]);

  if (!worker) return null;

  // Pagination calculation
  const totalItems = payments.length;
  const totalPages = Math.ceil(totalItems / limit);
  const start = (page - 1) * limit;
  const paginatedPayments = payments.slice(start, start + limit);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payments of ${worker.workerName}`} size="xl">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">ID</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Pitak</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Gross</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Net</th>
              <th className="text-right py-2 px-3 font-semibold text-[var(--text-secondary)]">Amount Paid</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Payment Date</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Last Payment</th>
              <th className="text-left py-2 px-3 font-semibold text-[var(--text-secondary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((payment) => (
              <tr key={payment.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
                <td className="py-2 px-3 text-[var(--text-primary)]">#{payment.id}</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">{payment.pitak?.location || "—"}</td>
                <td className="py-2 px-3 text-right text-[var(--text-secondary)]">{formatCurrency(payment.grossPay)}</td>
                <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(payment.netPay)}</td>
                <td className="py-2 px-3 text-right text-[var(--text-secondary)]">{formatCurrency(payment.amountPaid || 0)}</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">{formatDate(payment.paymentDate as string | undefined)}</td>
                <td className="py-2 px-3 text-[var(--text-secondary)]">{formatDate(payment.lastPaymentDate as string | undefined)}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[payment.status] || "bg-gray-100 text-gray-800"}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
            {paginatedPayments.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-[var(--text-tertiary)]">
                  No payments found
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
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded dark:bg-gray-700">
          Close
        </button>
      </div>
    </Modal>
  );
};
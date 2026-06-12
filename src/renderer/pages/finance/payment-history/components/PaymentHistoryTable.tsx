// src/renderer/pages/finance/payment-history/components/PaymentHistoryTable.tsx
import React from "react";
import ExpandableRow from "./ExpandableRow";
import type { PaymentHistoryWithDetails } from "../types";

interface PaymentHistoryTableProps {
  history: PaymentHistoryWithDetails[];
}

const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No payment history records found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Payment ID</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Action Type</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Changed Field</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Old Value</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">New Value</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Change Date</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Performed By</th>
            <th className="text-center py-3 px-4 font-semibold text-[var(--text-secondary)]">Details</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <ExpandableRow key={item.id} item={item}>
              <td className="py-2.5 px-4 text-[var(--text-primary)]">
                {item.payment?.id || item.payment?.id || "—"}
              </td>
              <td className="py-2.5 px-4 capitalize text-[var(--text-secondary)]">
                {item.actionType}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {item.changedField || "—"}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {item.oldValue || (item.oldAmount !== null ? item.oldAmount : "—")}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {item.newValue || (item.newAmount !== null ? item.newAmount : "—")}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {new Date(item.changeDate).toLocaleString()}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {item.performedBy || "—"}
              </td>
            </ExpandableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistoryTable;
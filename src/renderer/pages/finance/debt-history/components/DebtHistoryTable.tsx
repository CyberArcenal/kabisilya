// src/renderer/pages/finance/debt-history/components/DebtHistoryTable.tsx
import React from "react";
import ExpandableRow from "./ExpandableRow";
import type { DebtHistoryWithDetails } from "../types";

interface DebtHistoryTableProps {
  history: DebtHistoryWithDetails[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

const DebtHistoryTable: React.FC<DebtHistoryTableProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No debt history records found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Debt ID</th>
            <th className="text-left py-3 px-4">Transaction Type</th>
            <th className="text-right py-3 px-4">Amount Paid</th>
            <th className="text-right py-3 px-4">Previous Balance</th>
            <th className="text-right py-3 px-4">New Balance</th>
            <th className="text-left py-3 px-4">Transaction Date</th>
            <th className="text-left py-3 px-4">Payment Method</th>
            <th className="text-center py-3 px-4">Details</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <ExpandableRow key={item.id} item={item}>
              <td className="py-2.5 px-4 text-[var(--text-primary)]">
                {item.debt?.id || "—"}
              </td>
              <td className="py-2.5 px-4 capitalize text-[var(--text-secondary)]">
                {item.transactionType}
              </td>
              <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                {formatCurrency(item.amountPaid)}
              </td>
              <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                {formatCurrency(item.previousBalance)}
              </td>
              <td className="py-2.5 px-4 text-right text-[var(--text-secondary)]">
                {formatCurrency(item.newBalance)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {new Date(item.transactionDate).toLocaleString()}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                {item.paymentMethod || "—"}
              </td>
            </ExpandableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DebtHistoryTable;
// src/renderer/pages/finance/payment-history/components/ExpandableRow.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import type { PaymentHistoryWithDetails } from "../types";

interface ExpandableRowProps {
  item: PaymentHistoryWithDetails;
  children: React.ReactNode;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ item, children }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderDetails = () => {
    const details = {
      oldValue: item.oldValue,
      newValue: item.newValue,
      oldAmount: item.oldAmount,
      newAmount: item.newAmount,
      notes: item.notes,
      referenceNumber: item.referenceNumber,
    };
    return JSON.stringify(details, null, 2);
  };

  return (
    <>
      <tr className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
        {children}
        <td className="py-2.5 px-4 text-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-[var(--card-hover-bg)]"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[var(--card-secondary-bg)]">
          <td colSpan={100} className="px-4 py-3">
            <div className="text-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-[var(--text-secondary)]">Change Details</span>
                <button
                  onClick={() => copyToClipboard(renderDetails())}
                  className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)]"
                  title="Copy JSON"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-xs bg-[var(--card-bg)] p-2 rounded overflow-x-auto">
                {renderDetails()}
              </pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ExpandableRow;
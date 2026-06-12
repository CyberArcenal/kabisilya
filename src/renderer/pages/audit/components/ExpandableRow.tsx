// src/renderer/pages/audit/components/ExpandableRow.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { showSuccess } from "../../../utils/notification";

interface ExpandableRowProps {
  oldData?: string | null;
  newData?: string | null;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ oldData, newData }) => {
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copied to clipboard");
  };

  if (!oldData && !newData) return null;

  const formatJson = (str?: string | null) => {
    if (!str) return "—";
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const oldFormatted = formatJson(oldData);
  const newFormatted = formatJson(newData);

  return (
    <>
      <tr className="cursor-pointer hover:bg-[var(--card-hover-bg)]" onClick={() => setExpanded(!expanded)}>
        <td colSpan={6} className="py-2 px-4 text-center text-sm text-[var(--text-secondary)]">
          <button className="flex items-center gap-1 mx-auto">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Hide details" : "Show details"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[var(--card-secondary-bg)]">
          <td colSpan={6} className="px-4 py-3">
            <div className="space-y-3">
              {oldData && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">Previous Data:</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(oldFormatted); }}
                      className="p-1 rounded hover:bg-[var(--card-hover-bg)]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="text-xs bg-[var(--input-bg)] p-2 rounded overflow-x-auto border border-[var(--border-color)]">
                    {oldFormatted}
                  </pre>
                </div>
              )}
              {newData && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">New Data:</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(newFormatted); }}
                      className="p-1 rounded hover:bg-[var(--card-hover-bg)]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="text-xs bg-[var(--input-bg)] p-2 rounded overflow-x-auto border border-[var(--border-color)]">
                    {newFormatted}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default ExpandableRow;
// src/renderer/pages/audit/components/AuditTable.tsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import type { AuditLogEntry } from "../../../api/core/audit";
import { showSuccess } from "../../../utils/notification";

interface AuditTableProps {
  logs: AuditLogEntry[];
}

const ExpandableDetails: React.FC<{ oldData?: string | null; newData?: string | null }> = ({
  oldData,
  newData,
}) => {
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
    <tr>
      <td colSpan={6} className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? "Hide details" : "Show details"}
          </button>
        </div>
        {expanded && (
          <div className="mt-2 space-y-3">
            {oldData && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Previous Data:</span>
                  <button
                    onClick={() => copyToClipboard(oldFormatted)}
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
                    onClick={() => copyToClipboard(newFormatted)}
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
        )}
      </td>
    </tr>
  );
};

const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No audit logs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Timestamp</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">User</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Action</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Entity</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Entity ID</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => {
            const hasDetails = !!(log.previousData || log.newData);
            return (
              <React.Fragment key={log.id || idx}>
                <tr className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
                  <td className="py-2.5 px-4 text-[var(--text-secondary)] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">{log.user || "—"}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-[var(--text-secondary)]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">{log.entity}</td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">{log.entityId ?? "—"}</td>
                  <td className="py-2.5 px-4 max-w-md truncate text-[var(--text-secondary)]">
                    {log.description || "—"}
                  </td>
                </tr>
                {hasDetails && <ExpandableDetails oldData={log.previousData} newData={log.newData} />}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
// src/renderer/pages/audit/components/AuditTable.tsx
import React from "react";
import ExpandableRow from "./ExpandableRow";
import type { AuditLogEntry } from "../../../api/core/audit";

interface AuditTableProps {
  logs: AuditLogEntry[];
}

const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No audit logs found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Timestamp</th>
            <th className="text-left py-3 px-4">User</th>
            <th className="text-left py-3 px-4">Action</th>
            <th className="text-left py-3 px-4">Entity</th>
            <th className="text-left py-3 px-4">Entity ID</th>
            <th className="text-left py-3 px-4">Description</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <React.Fragment key={log.id || idx}>
              <tr className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)]">
                <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-2.5 px-4">{log.user || "—"}</td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-4">{log.entity}</td>
                <td className="py-2.5 px-4">{log.entityId ?? "—"}</td>
                <td className="py-2.5 px-4 max-w-md truncate">{log.description || "—"}</td>
              </tr>
              {(log.previousData || log.newData) && (
                <ExpandableRow oldData={log.previousData} newData={log.newData} />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
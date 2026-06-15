// src/renderer/pages/audit/index.tsx
import React from "react";
import { Download } from "lucide-react";
import Pagination from "../../components/UI/Pagination";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { useAuditLogs } from "./hooks/useAuditLogs";
import AuditFilters from "./components/AuditFilters";
import AuditTable from "./components/AuditTable";
import Button from "../../components/UI/Button";
import { showSuccess } from "../../utils/notification";

const AuditPage: React.FC = () => {
  const {
    logs,
    loading,
    page,
    pageSize,
    totalPages,
    filters,
    setPage,
    updateFilters,
    resetFilters,
    distinctEntities,
    distinctActions,
    distinctUsers,
  } = useAuditLogs();

  const startIndex = (page - 1) * pageSize;
  const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

  const handleExportCSV = () => {
    // Simple CSV export (client-side only)
    const headers = ["Timestamp", "User", "Action", "Entity", "Entity ID", "Description", "Previous Data", "New Data"];
    const rows = logs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.user || "",
      log.action,
      log.entity,
      log.entityId ?? "",
      log.description || "",
      log.previousData || "",
      log.newData || "",
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Export started");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Trail</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">System activity and change history</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      <AuditFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        distinctEntities={distinctEntities}
        distinctActions={distinctActions}
        distinctUsers={distinctUsers}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <AuditTable logs={paginatedLogs} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {logs.length} record{logs.length !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </div>
  );
};

export default AuditPage;
// src/renderer/pages/notification-logs/index.tsx
import React from "react";
import { RotateCw } from "lucide-react";
import Pagination from "../../components/UI/Pagination";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import Button from "../../components/UI/Button";
import { useNotificationLogs } from "./hooks/useNotificationLogs";
import NotificationLogFilters from "./components/NotificationLogFilters";
import NotificationLogTable from "./components/NotificationLogTable";
import ViewLogModal from "./components/ViewLogModal";

const NotificationLogsPage: React.FC = () => {
  const {
    logs,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    selectedLog,
    viewModal,
    setPage,
    updateFilters,
    resetFilters,
    handleRetryFailed,
    handleRetryAllFailed,
    handleResend,
    handleDelete,
    handleView,
  } = useNotificationLogs();

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notification Logs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Email & SMS notification history</p>
        </div>
        <Button variant="secondary" size="md" icon={RotateCw} onClick={handleRetryAllFailed}>
          Retry All Failed
        </Button>
      </div>

      <NotificationLogFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <NotificationLogTable
            logs={logs}
            onView={handleView}
            onRetry={handleRetryFailed}
            onResend={handleResend}
            onDelete={handleDelete}
          />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} record{totalCount !== 1 ? "s" : ""}
          </div>
        </>
      )}

      <ViewLogModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        log={selectedLog}
      />
    </div>
  );
};

export default NotificationLogsPage;
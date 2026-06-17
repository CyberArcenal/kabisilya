// src/renderer/pages/audit/index.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Download, Filter, Eye, EyeOff, FileText } from "lucide-react";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import { useAuditLogs } from "./hooks/useAuditLogs";
import AuditFilters from "./components/AuditFilters";
import AuditTable from "./components/AuditTable";
import Button from "../../components/UI/Button";
import { showSuccess } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

const AuditPage: React.FC = () => {
  const {
    logs,
    loading,
    page,
    limit,
    totalItems,
    filters,
    setPage,
    setLimit,
    updateFilters,
    resetFilters,
    distinctEntities,
    distinctActions,
    distinctUsers,
    refresh,
    exportCSV,
  } = useAuditLogs();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const totalLogs = totalItems;
  const latestLog = logs.length > 0 ? logs[0] : null;
  const entitiesCount = distinctEntities.length;

  // --- Global pagination integration ---
  const { setPagination, clearPagination } = usePagination();

  const handlePageChange = useCallback((newPage: number) => setPage(newPage), [setPage]);
  const handlePageSizeChange = useCallback((newSize: number) => {
    setLimit(newSize);
    setPage(1);
  }, [setLimit, setPage]);

  // Store handlers in ref to avoid effect dependencies on functions
  const handlersRef = useRef({
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  });
  useEffect(() => {
    handlersRef.current = {
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    };
  }, [handlePageChange, handlePageSizeChange]);

  // Track previous primitive values
  const prevPageRef = useRef(page);
  const prevTotalRef = useRef(totalItems);
  const prevLimitRef = useRef(limit);

  useEffect(() => {
    const pageChanged = prevPageRef.current !== page;
    const totalChanged = prevTotalRef.current !== totalItems;
    const limitChanged = prevLimitRef.current !== limit;

    if (pageChanged || totalChanged || limitChanged) {
      prevPageRef.current = page;
      prevTotalRef.current = totalItems;
      prevLimitRef.current = limit;

      setPagination({
        currentPage: page,
        totalItems: totalItems,
        pageSize: limit,
        onPageChange: handlersRef.current.onPageChange,
        onPageSizeChange: handlersRef.current.onPageSizeChange,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSize: true,
      });
    }
  }, [page, totalItems, limit, setPagination]);

  // Clear pagination on unmount
  useEffect(() => {
    return () => clearPagination();
  }, [clearPagination]);

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Audit Trail
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              System activity and change history
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showStats ? "Hide summary" : "Show summary"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all"
            title="Export filtered logs to CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Total Logs</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalLogs}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Tracked Entities</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{entitiesCount}</p>
          </div>
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-4 shadow-sm">
            <p className="text-sm text-[var(--text-secondary)]">Latest Activity</p>
            <p className="text-lg font-medium text-[var(--text-primary)]">
              {latestLog ? new Date(latestLog.timestamp).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <AuditFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={resetFilters}
          distinctEntities={distinctEntities}
          distinctActions={distinctActions}
          distinctUsers={distinctUsers}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <AuditTable logs={logs} />
      )}
    </div>
  );
};

export default AuditPage;
import React, { useCallback, useEffect, useRef } from "react";
import Pagination from "../../components/UI/Pagination";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import Button from "../../components/UI/Button";
import { useNotifications } from "./hooks/useNotifications";
import NotificationTable from "./components/NotificationTable";
import NotificationFilters from "./components/NotificationFilters";
import { usePagination } from "../../contexts/PaginationContext";

const NotificationsPage: React.FC = () => {
  const {
    limit,
    setLimit,
    notifications,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    setPage,
    updateFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    resetFilters,
  } = useNotifications();

    const { setPagination, clearPagination } = usePagination();
  
    // Stable callbacks – they depend on setPage/setLimit which should be stable
    const handlePageChange = useCallback(
      (newPage: number) => {
        setPage(newPage);
      },
      [setPage],
    );
  
    const handlePageSizeChange = useCallback(
      (newSize: number) => {
        setLimit(newSize);
        setPage(1);
      },
      [setLimit, setPage],
    );
  
    // Store the latest handlers in a ref so the effect can always use the current ones
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
  
    // Track previous primitive values to avoid unnecessary updates
    const prevPageRef = useRef(page);
    const prevTotalRef = useRef(totalCount);
    const prevLimitRef = useRef(limit);
  
    // Effect that only runs when primitive pagination data changes
    useEffect(() => {
      const pageChanged = prevPageRef.current !== page;
      const totalChanged = prevTotalRef.current !== totalCount;
      const limitChanged = prevLimitRef.current !== limit;
  
      if (pageChanged || totalChanged || limitChanged) {
        // Update refs
        prevPageRef.current = page;
        prevTotalRef.current = totalCount;
        prevLimitRef.current = limit;
  
        // Call setPagination with current primitives and the latest handlers from ref
        setPagination({
          currentPage: page,
          totalItems: totalCount,
          pageSize: limit,
          onPageChange: handlersRef.current.onPageChange,
          onPageSizeChange: handlersRef.current.onPageSizeChange,
          pageSizeOptions: [10, 25, 50, 100],
          showPageSize: true,
        });
      }
    }, [page, totalCount, limit, setPagination]); // Only these dependencies matter
  
    // Clear pagination on unmount
    useEffect(() => {
      return () => clearPagination();
    }, [clearPagination]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">All system notifications</p>
        </div>
        <Button variant="secondary" size="sm" onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      <NotificationFilters
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
          <NotificationTable
            notifications={notifications}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
          />
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
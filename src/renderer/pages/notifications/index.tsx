import React from "react";
import Pagination from "../../components/UI/Pagination";
import LoadingSpinner from "../../components/Shared/LoadingSpinner";
import Button from "../../components/UI/Button";
import { useNotifications } from "./hooks/useNotifications";
import NotificationTable from "./components/NotificationTable";
import NotificationFilters from "./components/NotificationFilters";

const NotificationsPage: React.FC = () => {
  const {
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          <div className="text-xs text-[var(--text-tertiary)] text-right">
            Total: {totalCount} notification{totalCount !== 1 ? "s" : ""}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPage;
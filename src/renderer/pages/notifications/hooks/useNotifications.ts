import { useState, useEffect, useCallback } from "react";
import type { NotificationFilters } from "../types";
import notificationAPI, { type Notification } from "../../../api/core/notifications";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({
    isRead: undefined,
    type: "",
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "DESC",
      };
      if (filters.isRead !== undefined) params.isRead = filters.isRead;
      if (filters.type) params.type = filters.type;

      const res = await notificationAPI.getAll(params);
      if (res.status) {
        setNotifications(res.data.items);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const updateFilters = (newFilters: Partial<NotificationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const markAsRead = async (id: number) => {
    await notificationAPI.markAsRead(id);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    await notificationAPI.markAllAsRead();
    await fetchNotifications();
  };

  const deleteNotification = async (id: number) => {
    await notificationAPI.delete(id);
    await fetchNotifications();
  };

  const resetFilters = () => {
    setFilters({ isRead: undefined, type: "" });
    setPage(1);
  };

  return {
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
  };
};
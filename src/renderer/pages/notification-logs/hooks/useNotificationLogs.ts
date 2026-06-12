// src/renderer/pages/notification-logs/hooks/useNotificationLogs.ts
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import type { NotificationLogFilters } from "../types";
import type { NotificationLogEntry } from "../../../api/core/notificationLog";
import notificationLogAPI from "../../../api/core/notificationLog";

export const useNotificationLogs = () => {
  const [logs, setLogs] = useState<NotificationLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<NotificationLogFilters>({
    status: "",
    recipient_email: "",
    startDate: "",
    endDate: "",
  });

  const [selectedLog, setSelectedLog] = useState<NotificationLogEntry | null>(null);
  const viewModal = useModal();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit,
        sortBy: "created_at",
        sortOrder: "DESC",
      };
      if (filters.status) params.status = filters.status;
      if (filters.recipient_email) params.recipient_email = filters.recipient_email;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await notificationLogAPI.findAll(params);
      if (res.status) {
        setLogs(res.data.items);
        setTotalCount(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      } else {
        setLogs([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Failed to fetch notification logs", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilters = (newFilters: Partial<NotificationLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      recipient_email: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const handleRetryFailed = async (id: number) => {
    try {
      const res = await notificationLogAPI.retryFailed(id);
      if (res.status) {
        await fetchLogs();
      } else {
        dialogs.alert({ title: "Retry Failed", message: res.message });
      }
    } catch (error) {
      console.error("Failed to retry", error);
    }
  };

  const handleRetryAllFailed = async () => {
    const confirmed = await dialogs.confirm({
      title: "Retry All Failed",
      message: "Are you sure you want to retry all failed notification logs?",
    });
    if (confirmed) {
      try {
        const res = await notificationLogAPI.retryAllFailed();
        if (res.status) {
          await fetchLogs();
          dialogs.alert({ title: "Retry Initiated", message: res.message });
        } else {
          dialogs.alert({ title: "Retry Failed", message: res.message });
        }
      } catch (error) {
        console.error("Failed to retry all", error);
      }
    }
  };

  const handleResend = async (id: number) => {
    try {
      const res = await notificationLogAPI.resend(id);
      if (res.status) {
        await fetchLogs();
      } else {
        dialogs.alert({ title: "Resend Failed", message: res.message });
      }
    } catch (error) {
      console.error("Failed to resend", error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Log",
      message: "Are you sure you want to delete this notification log?",
    });
    if (confirmed) {
      try {
        await notificationLogAPI.delete(id);
        await fetchLogs();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const handleView = (log: NotificationLogEntry) => {
    setSelectedLog(log);
    viewModal.open();
  };

  return {
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
    refresh: fetchLogs,
  };
};
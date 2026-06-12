// src/renderer/pages/system/sessions/hooks/useSessions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { SessionWithDetails, SessionFormData } from "../types";
import sessionAPI from "../../../../api/core/session";
import bukidAPI from "../../../../api/core/bukid";
import paymentAPI from "../../../../api/core/payment";
import assignmentAPI from "../../../../api/core/assignment";
import debtAPI from "../../../../api/core/debt";

// Constant page size (hindi na kailangan as state)
const PAGE_SIZE = 10;

export const useSessions = () => {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [editingSession, setEditingSession] = useState<(SessionFormData & { id: number }) | null>(null);

  const viewModal = useModal();
  const formModal = useModal();

  // Ref para i-track kung naka-mount pa ang component
  const isMountedRef = useRef(true);
  // Ref para ma-cancel ang previous request
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel ongoing request kapag nag-unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchSessions = useCallback(async () => {
    // Cancel previous request kung mayroon
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;

    setLoading(true);
    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "startDate",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (status) params.status = status;

      const res = await sessionAPI.getAll(params);
      // Kung na-abort na, huwag nang i-update ang state
      if (controller.signal.aborted) return;
      if (!isMountedRef.current) return;

      if (!res.status) throw new Error(res.message || "Failed to fetch sessions");
      setSessions(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch sessions", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, status]); // PAGE_SIZE ay constant, hindi kailangan sa dependencies

  // Fetch tuwing magbago ang page, search, o status
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this session?",
    });
    if (confirmed) {
      try {
        await sessionAPI.delete(id);
        await fetchSessions();
      } catch (error) {
        console.error("Failed to delete session", error);
      }
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await sessionAPI.updateStatus(id, "active");
      await fetchSessions();
    } catch (error) {
      console.error("Failed to set session active", error);
    }
  };

  const handleView = async (session: SessionWithDetails) => {
    try {
      const [bukidsRes, assignmentsRes, paymentsRes, debtsRes] = await Promise.all([
        bukidAPI.getAll({ sessionId: session.id, limit: 1 }),
        assignmentAPI.getAll({ sessionId: session.id, limit: 1 }),
        paymentAPI.getAll({ sessionId: session.id, limit: 1 }),
        debtAPI.getAll({ sessionId: session.id, limit: 1 }),
      ]);
      const stats = {
        totalBukids: bukidsRes.status ? bukidsRes.data.pagination.total : 0,
        totalAssignments: assignmentsRes.status ? assignmentsRes.data.pagination.total : 0,
        totalPayments: paymentsRes.status ? paymentsRes.data.pagination.total : 0,
        totalDebts: debtsRes.status ? debtsRes.data.pagination.total : 0,
      };
      setSelectedSession({ ...session, ...stats });
    } catch (error) {
      console.error("Failed to fetch session stats", error);
      setSelectedSession(session);
    }
    viewModal.open();
  };

  const handleEdit = (session: SessionWithDetails) => {
    setEditingSession({
      id: session.id,
      name: session.name,
      year: session.year,
      startDate: session.startDate.split("T")[0],
      endDate: session.endDate ? session.endDate.split("T")[0] : "",
      seasonType: session.seasonType || "",
      status: session.status,
      notes: session.notes || "",
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingSession(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingSession(null);
    fetchSessions();
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  return {
    sessions,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, status },
    setPage,
    setSearch,
    setStatus,
    selectedSession,
    editingSession,
    viewModal,
    formModal,
    handleDelete,
    handleSetActive,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
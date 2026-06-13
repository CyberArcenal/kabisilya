// src/renderer/pages/system/sessions/hooks/useSessions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { SessionWithDetails, SessionFormData } from "../types";
import sessionAPI from "../../../../api/core/session";
import bukidAPI from "../../../../api/core/bukid";
import paymentAPI from "../../../../api/core/payment";
import assignmentAPI from "../../../../api/core/assignment";
import debtAPI from "../../../../api/core/debt";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const useSessions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");

  // Selected session for modals
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [editingSession, setEditingSession] = useState<(SessionFormData & { id: number }) | null>(null);
  const [statusChangeSession, setStatusChangeSession] = useState<SessionWithDetails | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const statusModal = useModal();

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const statusDebounceRef = useRef<NodeJS.Timeout>();

  const updateUrl = useCallback(
    (newPage: number, newSearch: string, newStatus: string) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newStatus) params.status = newStatus;
      if (newPage > 1) params.page = newPage.toString();
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Sync URL changes to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlStatus = searchParams.get("status") || "";

    let needsUpdate = false;
    const newPage = urlPage ? parseInt(urlPage, 10) : 1;
    if (newPage !== page) {
      setPageState(newPage);
      needsUpdate = true;
    }
    if (urlSearch !== search) {
      setSearchState(urlSearch);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
  }, [searchParams]);

  // Setters with URL update
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, status);
  };

  const setSearch = (val: string) => {
    setSearchState(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateUrl(1, val, status);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    statusDebounceRef.current = setTimeout(() => {
      updateUrl(1, search, val);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setSearchState("");
    setStatusState("");
    setPageState(1);
    updateUrl(1, "", "");
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      if (statusDebounceRef.current) clearTimeout(statusDebounceRef.current);
    };
  }, []);

  const fetchSessions = useCallback(async () => {
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
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch sessions");
      setSessions(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch sessions", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Session",
      message: "Are you sure you want to delete this session? This action cannot be undone.",
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

  const handleChangeStatus = (session: SessionWithDetails) => {
    setStatusChangeSession(session);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeSession) return;
    await sessionAPI.updateStatus(statusChangeSession.id, newStatus);
    await fetchSessions();
    setStatusChangeSession(null);
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
    statusChangeSession,
    statusModal,
    handleDelete,
    handleSetActive,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleChangeStatus,
    handleConfirmStatusChange,
    resetFilters,
  };
};
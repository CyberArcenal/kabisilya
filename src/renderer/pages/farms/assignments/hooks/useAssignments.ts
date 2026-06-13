// src/renderer/pages/farms/assignments/hooks/useAssignments.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { AssignmentWithDetails, AssignmentFormData } from "../types";
import assignmentAPI from "../../../../api/core/assignment";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

export const useAssignments = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPageState] = useState(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters (initialized from URL)
  const [search, setSearchState] = useState(() => searchParams.get("search") || "");
  const [workerId, setWorkerIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("worker");
    return id ? parseInt(id, 10) : undefined;
  });
  const [pitakId, setPitakIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("pitak");
    return id ? parseInt(id, 10) : undefined;
  });
  const [sessionId, setSessionIdState] = useState<number | undefined>(() => {
    const id = searchParams.get("session");
    return id ? parseInt(id, 10) : undefined;
  });
  const [status, setStatusState] = useState(() => searchParams.get("status") || "");
  const [startDate, setStartDateState] = useState(() => searchParams.get("startDate") || "");
  const [endDate, setEndDateState] = useState(() => searchParams.get("endDate") || "");

  // Selected for modals
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<(AssignmentFormData & { id: number }) | null>(null);
  const [statusChangeAssignment, setStatusChangeAssignment] = useState<AssignmentWithDetails | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const bulkModal = useModal();
  const statusModal = useModal();

  // Refs for abort control and debounce
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRefs = {
    search: useRef<NodeJS.Timeout>(),
    workerId: useRef<NodeJS.Timeout>(),
    pitakId: useRef<NodeJS.Timeout>(),
    sessionId: useRef<NodeJS.Timeout>(),
    status: useRef<NodeJS.Timeout>(),
    startDate: useRef<NodeJS.Timeout>(),
    endDate: useRef<NodeJS.Timeout>(),
  };

  // Helper: update URL with current filters
  const updateUrl = useCallback(
    (
      newPage: number,
      newSearch: string,
      newWorkerId: number | undefined,
      newPitakId: number | undefined,
      newSessionId: number | undefined,
      newStatus: string,
      newStartDate: string,
      newEndDate: string
    ) => {
      const params: Record<string, string> = {};
      if (newSearch) params.search = newSearch;
      if (newWorkerId) params.worker = newWorkerId.toString();
      if (newPitakId) params.pitak = newPitakId.toString();
      if (newSessionId) params.session = newSessionId.toString();
      if (newStatus) params.status = newStatus;
      if (newStartDate) params.startDate = newStartDate;
      if (newEndDate) params.endDate = newEndDate;
      if (newPage > 1) params.page = newPage.toString();
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  // Sync URL changes (browser back/forward) to state
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlSearch = searchParams.get("search") || "";
    const urlWorker = searchParams.get("worker");
    const urlPitak = searchParams.get("pitak");
    const urlSession = searchParams.get("session");
    const urlStatus = searchParams.get("status") || "";
    const urlStartDate = searchParams.get("startDate") || "";
    const urlEndDate = searchParams.get("endDate") || "";

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
    const newWorkerId = urlWorker ? parseInt(urlWorker, 10) : undefined;
    if (newWorkerId !== workerId) {
      setWorkerIdState(newWorkerId);
      needsUpdate = true;
    }
    const newPitakId = urlPitak ? parseInt(urlPitak, 10) : undefined;
    if (newPitakId !== pitakId) {
      setPitakIdState(newPitakId);
      needsUpdate = true;
    }
    const newSessionId = urlSession ? parseInt(urlSession, 10) : undefined;
    if (newSessionId !== sessionId) {
      setSessionIdState(newSessionId);
      needsUpdate = true;
    }
    if (urlStatus !== status) {
      setStatusState(urlStatus);
      needsUpdate = true;
    }
    if (urlStartDate !== startDate) {
      setStartDateState(urlStartDate);
      needsUpdate = true;
    }
    if (urlEndDate !== endDate) {
      setEndDateState(urlEndDate);
      needsUpdate = true;
    }
  }, [searchParams]); // runs when URL changes (back/forward)

  // Setters that update state and URL
  const setPage = (newPage: number) => {
    if (newPage === page) return;
    setPageState(newPage);
    updateUrl(newPage, search, workerId, pitakId, sessionId, status, startDate, endDate);
  };

  const setSearch = (val: string) => {
    setSearchState(val);
    if (debounceRefs.search.current) clearTimeout(debounceRefs.search.current);
    debounceRefs.search.current = setTimeout(() => {
      updateUrl(1, val, workerId, pitakId, sessionId, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setWorkerId = (val: number | undefined) => {
    setWorkerIdState(val);
    if (debounceRefs.workerId.current) clearTimeout(debounceRefs.workerId.current);
    debounceRefs.workerId.current = setTimeout(() => {
      updateUrl(1, search, val, pitakId, sessionId, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setPitakId = (val: number | undefined) => {
    setPitakIdState(val);
    if (debounceRefs.pitakId.current) clearTimeout(debounceRefs.pitakId.current);
    debounceRefs.pitakId.current = setTimeout(() => {
      updateUrl(1, search, workerId, val, sessionId, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setSessionId = (val: number | undefined) => {
    setSessionIdState(val);
    if (debounceRefs.sessionId.current) clearTimeout(debounceRefs.sessionId.current);
    debounceRefs.sessionId.current = setTimeout(() => {
      updateUrl(1, search, workerId, pitakId, val, status, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStatus = (val: string) => {
    setStatusState(val);
    if (debounceRefs.status.current) clearTimeout(debounceRefs.status.current);
    debounceRefs.status.current = setTimeout(() => {
      updateUrl(1, search, workerId, pitakId, sessionId, val, startDate, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setStartDate = (val: string) => {
    setStartDateState(val);
    if (debounceRefs.startDate.current) clearTimeout(debounceRefs.startDate.current);
    debounceRefs.startDate.current = setTimeout(() => {
      updateUrl(1, search, workerId, pitakId, sessionId, status, val, endDate);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const setEndDate = (val: string) => {
    setEndDateState(val);
    if (debounceRefs.endDate.current) clearTimeout(debounceRefs.endDate.current);
    debounceRefs.endDate.current = setTimeout(() => {
      updateUrl(1, search, workerId, pitakId, sessionId, status, startDate, val);
      setPageState(1);
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setSearchState("");
    setWorkerIdState(undefined);
    setPitakIdState(undefined);
    setSessionIdState(undefined);
    setStatusState("");
    setStartDateState("");
    setEndDateState("");
    setPageState(1);
    updateUrl(1, "", undefined, undefined, undefined, "", "", "");
  };

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      Object.values(debounceRefs).forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
    };
  }, []);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "assignmentDate",
        sortOrder: "DESC",
      };
      if (search) params.search = search;
      if (workerId) params.workerId = workerId;
      if (pitakId) params.pitakId = pitakId;
      if (sessionId) params.sessionId = sessionId;
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await assignmentAPI.getAll(params);
      if (controller.signal.aborted || !isMountedRef.current) return;
      if (!res.status) throw new Error(res.message || "Failed to fetch assignments");

      setAssignments(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error: any) {
      if (error.name === "AbortError") return;
      console.error("Failed to fetch assignments", error);
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, workerId, pitakId, sessionId, status, startDate, endDate]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // CRUD Handlers
  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Assignment",
      message: "Are you sure you want to delete this assignment?",
    });
    if (confirmed) {
      try {
        await assignmentAPI.delete(id);
        await fetchAssignments();
      } catch (error) {
        console.error("Failed to delete assignment", error);
      }
    }
  };

  const handleView = (assignment: AssignmentWithDetails) => {
    setSelectedAssignment(assignment);
    viewModal.open();
  };

  const handleEdit = (assignment: AssignmentWithDetails) => {
    setEditingAssignment({
      id: assignment.id,
      workerId: assignment.worker?.id || 0,
      pitakId: assignment.pitak?.id || 0,
      sessionId: assignment.session?.id || 0,
      assignmentDate: assignment.assignmentDate.split("T")[0],
      notes: assignment.notes || "",
      status: assignment.status,
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingAssignment(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingAssignment(null);
    fetchAssignments();
  };

  const handleBulkSuccess = () => {
    bulkModal.close();
    fetchAssignments();
  };

  const handleChangeStatus = (assignment: AssignmentWithDetails) => {
    setStatusChangeAssignment(assignment);
    statusModal.open();
  };

  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!statusChangeAssignment) return;
    await assignmentAPI.updateStatus(statusChangeAssignment.id, newStatus);
    await fetchAssignments();
    setStatusChangeAssignment(null);
  };

  return {
    assignments,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, workerId, pitakId, sessionId, status, startDate, endDate },
    setPage,
    setSearch,
    setWorkerId,
    setPitakId,
    setSessionId,
    setStatus,
    setStartDate,
    setEndDate,
    statusChangeAssignment,
    statusModal,
    handleChangeStatus,
    handleConfirmStatusChange,
    selectedAssignment,
    editingAssignment,
    viewModal,
    formModal,
    bulkModal,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    handleBulkSuccess,
    resetFilters,
  };
};
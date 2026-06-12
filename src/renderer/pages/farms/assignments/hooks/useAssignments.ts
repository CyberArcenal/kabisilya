// src/renderer/pages/farms/assignments/hooks/useAssignments.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { AssignmentWithDetails, AssignmentFormData } from "../types";
import assignmentAPI from "../../../../api/core/assignment";

const PAGE_SIZE = 10; // constant

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<number | undefined>(undefined);
  const [pitakId, setPitakId] = useState<number | undefined>(undefined);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected for modals
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithDetails | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<(AssignmentFormData & { id: number }) | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();
  const bulkModal = useModal();

  // Refs for abort control
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchAssignments = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!isMountedRef.current) return;
    setLoading(true);

    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,        // ✅ changed from pageSize to limit
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

  const resetFilters = () => {
    setSearch("");
    setWorkerId(undefined);
    setPitakId(undefined);
    setSessionId(undefined);
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
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
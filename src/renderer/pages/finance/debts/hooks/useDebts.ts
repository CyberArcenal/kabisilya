// src/renderer/pages/finance/debts/hooks/useDebts.ts
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../../../hooks/useModal";
import { dialogs } from "../../../../utils/dialogs";
import type { DebtWithDetails, DebtFormData } from "../types";
import debtAPI from "../../../../api/core/debt";

export const useDebts = () => {
  const [debts, setDebts] = useState<DebtWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [workerId, setWorkerId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [dueDateStart, setDueDateStart] = useState("");
  const [dueDateEnd, setDueDateEnd] = useState("");
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

  // Selected debt for modals
  const [selectedDebt, setSelectedDebt] = useState<DebtWithDetails | null>(null);
  const [editingDebt, setEditingDebt] = useState<(DebtFormData & { id: number }) | null>(null);

  // Modals
  const viewModal = useModal();
  const formModal = useModal();

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        sortBy: "dueDate",
        sortOrder: "ASC",
      };
      if (search) params.search = search;
      if (workerId) params.workerId = workerId;
      if (status) params.status = status;
      if (dueDateStart) params.dueDateStart = dueDateStart;
      if (dueDateEnd) params.dueDateEnd = dueDateEnd;
      if (minAmount !== undefined) params.minAmount = minAmount;
      if (maxAmount !== undefined) params.maxAmount = maxAmount;

      const res = await debtAPI.getAll(params);
      if (!res.status) throw new Error(res.message || "Failed to fetch debts");

      setDebts(res.data.items);
      setTotalCount(res.data.pagination.total);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch debts", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, workerId, status, dueDateStart, dueDateEnd, minAmount, maxAmount]);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleDelete = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Debt",
      message: "Are you sure you want to delete this debt record?",
    });
    if (confirmed) {
      try {
        await debtAPI.delete(id);
        await fetchDebts();
      } catch (error) {
        console.error("Failed to delete debt", error);
      }
    }
  };

  const handleView = (debt: DebtWithDetails) => {
    setSelectedDebt(debt);
    viewModal.open();
  };

  const handleEdit = (debt: DebtWithDetails) => {
    setEditingDebt({
      id: debt.id,
      workerId: debt.worker?.id || 0,
      sessionId: debt.session?.id || 0,
      amount: debt.amount,
      dueDate: debt.dueDate ? debt.dueDate.split("T")[0] : "",
      interestRate: debt.interestRate,
      reason: debt.reason || "",
      status: debt.status,
    });
    formModal.open();
  };

  const handleAddNew = () => {
    setEditingDebt(null);
    formModal.open();
  };

  const handleFormSuccess = () => {
    formModal.close();
    setEditingDebt(null);
    fetchDebts();
  };

  const resetFilters = () => {
    setSearch("");
    setWorkerId(undefined);
    setStatus("");
    setDueDateStart("");
    setDueDateEnd("");
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setPage(1);
  };

  return {
    debts,
    loading,
    page,
    totalPages,
    totalCount,
    filters: { search, workerId, status, dueDateStart, dueDateEnd, minAmount, maxAmount },
    setPage,
    setSearch,
    setWorkerId,
    setStatus,
    setDueDateStart,
    setDueDateEnd,
    setMinAmount,
    setMaxAmount,
    selectedDebt,
    editingDebt,
    viewModal,
    formModal,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
  };
};
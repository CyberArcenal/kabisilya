// src/renderer/pages/farms/bukid/index.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Filter,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import Button from "../../../components/UI/Button";
import Pagination from "../../../components/UI/Pagination";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import SessionSelect from "../../../components/Selects/SessionSelect";
import { useBukids, type BukidWithPitaks } from "./hooks/useBukids";
import BukidTable from "./components/BukidTable";
import BukidFormModal from "./components/BukidFormModal";
import BukidViewModal from "./components/ViewBukidModal";
import PitakViewModal from "../pitak/components/PitakViewModal";
import { useModal } from "../../../hooks/useModal";
import pitakAPI from "../../../api/core/pitak";
import type { Pitak } from "../../../api/core/pitak";
import ChangeStatusModal from "./components/ChangeStatusModal";
import ViewWorkerModal from "../../workers/components/ViewWorkerModal";
import BukidSummaryCards from "./components/BukidSummaryCards";
import BulkActionsBar from "./components/BulkActionsBar";
import PitakFormModal from "../pitak/components/PitakFormModal";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "initiated", label: "Initiated" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const BukidPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    bukids,
    loading,
    page,
    totalPages,
    totalCount,
    filters,
    stats,
    limit,
    sortBy,
    sortOrder,
    selectedBukid,
    editingBukid,
    viewModal,
    formModal,
    statusChangeBukid,
    statusModal,
    selectedIds,
    setSelectedIds,
    bulkDelete,
    bulkStatusChange,
    bulkExport,
    handleChangeStatus,
    handleConfirmStatusChange,
    setPage,
    setLimit,
    setSort,
    setSearch,
    setStatus,
    setSessionId,
    handleDelete,
    handleView,
    handleEdit,
    handleAddNew,
    handleFormSuccess,
    resetFilters,
    refetch,
    exportToCSV,
  } = useBukids();

  const pitakModal = useModal();
  const pitakFormModal = useModal();
  const workerModal = useModal();
  const [selectedPitak, setSelectedPitak] = useState<Pitak | null>(null);
  const [loadingPitak, setLoadingPitak] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = !!(filters.search || filters.status || filters.sessionId);

  const handlePitakClick = async (pitakId: number) => {
    setLoadingPitak(true);
    try {
      const res = await pitakAPI.getById(pitakId);
      if (res.status && res.data) {
        setSelectedPitak(res.data);
        pitakModal.open();
      }
    } catch (error) {
      console.error("Failed to fetch pitak details", error);
    } finally {
      setLoadingPitak(false);
    }
  };

  const handleAddPlot = (bukid: BukidWithPitaks) => {
    pitakFormModal.setInitial({ bukidId: bukid.id, bukidName: bukid.name });
    pitakFormModal.open();
  };

  const handleWorkerClickFromModal = (worker: any) => {
    workerModal.setSelected(worker.id);
    workerModal.open();
  };

  const handleViewPlots = (bukidId: number) => {
    navigate(`/farms/pitak?bukid=${bukidId}`);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Farm Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage all farms (bukid) and their plots
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary cards" : "Show summary cards"}
          >
            {showStats ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors"
            title="Export all farms (current filters)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-md hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAddNew}
          >
            Add Farm
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {showStats && (
        <BukidSummaryCards
          totalFarms={stats.totalFarms}
          activeFarms={stats.activeFarms}
          completedFarms={stats.completedFarms}
          totalArea={stats.totalArea}
          totalPitaks={stats.totalPitaks}
        />
      )}

      {/* Filters Bar */}
      {showFilters && (
        <div className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <Filter className="w-4 h-4" /> Filters
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={filters.search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
            <select
              value={filters.status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SessionSelect
              value={filters.sessionId || null}
              onChange={(id) => {
                setSessionId(id || undefined);
                setPage(1);
              }}
              placeholder="All sessions"
            />
          </div>
          {hasFilters && (
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.length}
          onStatusChange={(newStatus) =>
            bulkStatusChange(selectedIds, newStatus)
          }
          onDelete={() => bulkDelete(selectedIds)}
          onExport={bulkExport}
          onClearSelection={() => setSelectedIds([])}
        />
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <>
          <BukidTable
            bukids={bukids}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPitakClick={handlePitakClick}
            onChangeStatus={handleChangeStatus}
            onViewPlots={handleViewPlots}
            onSort={setSort}
            selectedIds={selectedIds}
            onSelectRow={(id, checked) => {
              setSelectedIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id),
              );
            }}
            onSelectAll={(checked) => {
              setSelectedIds(checked ? bukids.map((b) => b.id) : []);
            }}
            onAddPlot={handleAddPlot}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
          <Pagination
            currentPage={page}
            totalItems={totalCount}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={true}
          />
        </>
      )}

      {/* Modals */}
      <BukidViewModal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        bukid={selectedBukid}
        onPitakClick={handlePitakClick}
      />
      <BukidFormModal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        onSuccess={handleFormSuccess}
        initialData={editingBukid}
      />
      {!loadingPitak && (
        <PitakViewModal
          isOpen={pitakModal.isOpen}
          onClose={pitakModal.close}
          pitak={selectedPitak}
          onWorkerClick={handleWorkerClickFromModal}
        />
      )}
      <PitakFormModal
        isOpen={pitakFormModal.isOpen}
        onClose={() => {
          pitakFormModal.close();
          pitakFormModal.setInitial(null); // clear initial data
        }}
        onSuccess={() => {
          refetch(); // refresh bukid list to show updated plot count
          pitakFormModal.close();
          pitakFormModal.setInitial(null);
        }}
        initialData={pitakFormModal.initialData}
      />
      <ChangeStatusModal
        isOpen={statusModal.isOpen}
        onClose={statusModal.close}
        bukidName={statusChangeBukid?.name || ""}
        currentStatus={statusChangeBukid?.status || ""}
        onConfirm={handleConfirmStatusChange}
      />
      <ViewWorkerModal
        isOpen={workerModal.isOpen}
        onClose={workerModal.close}
        workerId={workerModal.selectedId ? workerModal.selectedId : null}
      />
    </div>
  );
};

export default BukidPage;

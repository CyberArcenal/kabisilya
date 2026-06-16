import React from "react";
import { Trash2, GitBranch, Download, X } from "lucide-react";
import Button from "../../../../components/UI/Button";

interface BulkActionsBarProps {
  selectedCount: number;
  onStatusChange: (newStatus: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onExport: () => void; // added
  onClearSelection: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onStatusChange,
  onDelete,
  onExport,
  onClearSelection,
}) => {
  const [statusLoading, setStatusLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatusLoading(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await onDelete();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-[var(--primary-color)]/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 border border-[var(--primary-color)]/30">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {selectedCount} worker{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={onClearSelection}
          className="p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" icon={Download} onClick={onExport}>
          Export
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={GitBranch}
          onClick={() => handleStatusChange("paid")}
          loading={statusLoading}
        >
          Mark Paid
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={GitBranch}
          onClick={() => handleStatusChange("cancelled")}
          loading={statusLoading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={handleDelete}
          loading={deleteLoading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
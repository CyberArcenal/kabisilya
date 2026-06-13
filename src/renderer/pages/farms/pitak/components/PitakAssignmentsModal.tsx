// src/renderer/pages/farms/pitak/components/PitakAssignmentsModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";
import assignmentAPI from "../../../../api/core/assignment";
import type { Assignment } from "../../../../api/core/assignment";
import { XCircle, User, Calendar } from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pitakId: number;
  pitakLocation: string;
  onAssignmentDeleted: () => void; // rename to onAssignmentChanged? but keep for compatibility
}

const PitakAssignmentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pitakId,
  pitakLocation,
  onAssignmentDeleted,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await assignmentAPI.getAll({
        pitakId,
        limit: 100,
        sortBy: "assignmentDate",
        sortOrder: "DESC",
      });
      if (res.status) {
        setAssignments(res.data.items);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error("Failed to fetch assignments", error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && pitakId) {
      fetchAssignments();
    }
  }, [isOpen, pitakId]);

  const handleCancel = async (assignmentId: number, workerName: string) => {
    const confirmed = await dialogs.confirm({
      title: "Cancel Assignment",
      message: `Are you sure you want to cancel the assignment of ${workerName} from this plot?`,
      confirmText: "Cancel Assignment",
      icon: "warning",
    });
    if (!confirmed) return;
    setCancellingId(assignmentId);
    try {
      await assignmentAPI.updateStatus(assignmentId, "cancelled");
      await fetchAssignments();
      onAssignmentDeleted(); // refresh the pitak list to update avatars
      dialogs.success(`Assignment for ${workerName} has been cancelled.`);
    } catch (error) {
      console.error("Failed to cancel assignment", error);
      dialogs.error("Failed to cancel assignment");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      initiated: "bg-yellow-500/20 text-yellow-400",
      completed: "bg-blue-500/20 text-blue-400",
      cancelled: "bg-red-500/20 text-red-400",
    };
    return `px-2 py-0.5 rounded-full text-xs ${colors[status] || "bg-gray-500/20 text-gray-400"}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assigned Workers - ${pitakLocation}`}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-tertiary)]">
          No workers assigned to this plot.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
              <tr>
                <th className="text-left py-2 px-3">Worker</th>
                <th className="text-left py-2 px-3">Assignment Date</th>
                <th className="text-left py-2 px-3">Luwang Count</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((ass) => (
                <tr key={ass.id} className="border-b border-[var(--border-color)]">
                  <td className="py-2 px-3 font-medium">{ass.worker?.name || "—"}</td>
                  <td className="py-2 px-3">{formatDate(ass.assignmentDate)}</td>
                  <td className="py-2 px-3">{ass.luwangCount}</td>
                  <td className="py-2 px-3">
                    <span className={getStatusBadge(ass.status)}>{ass.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    {ass.status !== "cancelled" && ass.status !== "completed" ? (
                      <button
                        onClick={() => handleCancel(ass.id, ass.worker?.name || "Unknown")}
                        disabled={cancellingId === ass.id}
                        className="p-1 rounded-md hover:bg-red-500/20 text-[var(--text-tertiary)] hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Cancel assignment"
                      >
                        {cancellingId === ass.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-[var(--text-tertiary)] italic">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default PitakAssignmentsModal;
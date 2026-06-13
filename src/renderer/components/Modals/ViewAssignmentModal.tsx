// src/components/Modals/ViewAssignmentModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import LoadingSpinner from "../Shared/LoadingSpinner";
import { format } from "date-fns";
import type { Assignment } from "../../api/core/assignment";
import assignmentAPI from "../../api/core/assignment";

interface ViewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number | null;
}

const ViewAssignmentModal: React.FC<ViewAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !assignmentId) return;
    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await assignmentAPI.getById(assignmentId);
        if (res.status) {
          setAssignment(res.data);
        } else {
          setError(res.message || "Failed to load assignment");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [isOpen, assignmentId]);

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "completed": return "text-blue-600 bg-blue-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Details" size="md">
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      )}
      {error && (
        <div className="text-center py-8 text-red-500">{error}</div>
      )}
      {assignment && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Worker</label>
              <p className="text-[var(--text-primary)] font-medium">{assignment.worker?.name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Plot</label>
              <p>{assignment.pitak?.location || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Session</label>
              <p>{assignment.session?.name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Luwang Count</label>
              <p>{assignment.luwangCount}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Assignment Date</label>
              <p>{format(new Date(assignment.assignmentDate), "PPP")}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
              <p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Notes</label>
              <p className="whitespace-pre-wrap">{assignment.notes || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Created At</label>
              <p>{format(new Date(assignment.createdAt), "PPp")}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-tertiary)]">Last Updated</label>
              <p>{format(new Date(assignment.updatedAt), "PPp")}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewAssignmentModal;
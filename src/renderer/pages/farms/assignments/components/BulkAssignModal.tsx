// src/renderer/pages/farms/assignments/components/BulkAssignModal.tsx
import React, { useState } from "react";
import assignmentAPI from "../../../../api/core/assignment";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import Button from "../../../../components/UI/Button";
import Modal from "../../../../components/UI/Modal";
import PitakSelect from "../../../../components/Selects/PitakSelect";
import SessionSelect from "../../../../components/Selects/SessionSelect";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkAssignModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [workerIds, setWorkerIds] = useState<number[]>([]);
  const [currentWorkerId, setCurrentWorkerId] = useState<number | null>(null);
  const [pitakId, setPitakId] = useState<number>(0);
  const [sessionId, setSessionId] = useState<number>(0);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addWorker = () => {
    if (currentWorkerId && !workerIds.includes(currentWorkerId)) {
      setWorkerIds([...workerIds, currentWorkerId]);
      setCurrentWorkerId(null);
    }
  };

  const removeWorker = (id: number) => {
    setWorkerIds(workerIds.filter(wid => wid !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workerIds.length === 0 || !pitakId || !sessionId) return;
    setSubmitting(true);
    try {
      await assignmentAPI.createBulk({
        workerIds,
        pitakId,
        sessionId,
        assignmentDate,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to bulk assign", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Assign Workers" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Workers *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <WorkerSelect
                value={currentWorkerId}
                onChange={(id) => setCurrentWorkerId(id)}
                placeholder="Select a worker to add"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addWorker}>
              Add
            </Button>
          </div>
          {workerIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {workerIds.map((wid) => (
                <div key={wid} className="flex items-center gap-1 px-2 py-1 bg-[var(--card-secondary-bg)] rounded-full text-sm">
                  Worker #{wid}
                  <button type="button" onClick={() => removeWorker(wid)} className="text-red-500 hover:text-red-700 ml-1">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plot *</label>
          <PitakSelect
            value={pitakId}
            onChange={(id) => setPitakId(id || 0)}
            placeholder="Select plot"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Session *</label>
          <SessionSelect
            value={sessionId}
            onChange={(id) => setSessionId(id || 0)}
            placeholder="Select session"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assignment Date *</label>
          <input
            type="date"
            value={assignmentDate}
            onChange={(e) => setAssignmentDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes (optional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>
            Assign {workerIds.length} Worker{workerIds.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkAssignModal;
// src/renderer/pages/farms/assignments/components/BulkAssignModal.tsx
import React, { useState, useEffect } from "react";
import assignmentAPI from "../../../../api/core/assignment";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import Button from "../../../../components/UI/Button";
import Modal from "../../../../components/UI/Modal";
import PitakSelect from "../../../../components/Selects/PitakSelect";
import { showWarning } from "../../../../utils/notification";
import { useDefaultSessionId } from "../../../../utils/config/farmConfig";
import workerAPI from "../../../../api/core/worker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { pitakId: number; pitakLocation?: string } | null;
}

interface SelectedWorker {
  id: number;
  name: string;
}

const BulkAssignModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultSessionId = useDefaultSessionId();
  const [selectedWorkers, setSelectedWorkers] = useState<SelectedWorker[]>([]);
  const [currentWorkerId, setCurrentWorkerId] = useState<number | null>(null);
  const [pitakId, setPitakId] = useState<number>(initialData?.pitakId || 0);
  const [assignmentDate, setAssignmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentWorkerName, setCurrentWorkerName] = useState<string>("");

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setSelectedWorkers([]);
      setCurrentWorkerId(null);
      setCurrentWorkerName("");
      setPitakId(initialData?.pitakId || 0);
      setAssignmentDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [isOpen, initialData]);

  const addWorker = async () => {
    if (!currentWorkerId) return;
    // Check if already added
    if (selectedWorkers.some(w => w.id === currentWorkerId)) {
      showWarning("Worker already added.");
      return;
    }
    // Fetch worker name if not already known
    let workerName = currentWorkerName;
    if (!workerName) {
      try {
        const res = await workerAPI.getById(currentWorkerId);
        if (res.status && res.data) {
          workerName = res.data.name;
        } else {
          workerName = `Worker #${currentWorkerId}`;
        }
      } catch {
        workerName = `Worker #${currentWorkerId}`;
      }
    }
    setSelectedWorkers([...selectedWorkers, { id: currentWorkerId, name: workerName }]);
    setCurrentWorkerId(null);
    setCurrentWorkerName("");
  };

  const removeWorker = (id: number) => {
    setSelectedWorkers(selectedWorkers.filter(w => w.id !== id));
  };

  const handleWorkerSelect = (id: number | null) => {
    setCurrentWorkerId(id);
    setCurrentWorkerName(""); // reset name, will be fetched on add
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkers.length === 0) {
      showWarning("Please select at least one worker.");
      return;
    }
    if (!pitakId) {
      showWarning("Please select a plot.");
      return;
    }
    if (!defaultSessionId) {
      showWarning("No default session configured. Please set a default session in system settings.");
      return;
    }
    setSubmitting(true);
    try {
      await assignmentAPI.createBulk({
        workerIds: selectedWorkers.map(w => w.id),
        pitakId,
        sessionId: defaultSessionId,
        assignmentDate,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to bulk assign", error);
      showWarning("Failed to create assignments. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPlotLocked = !!(initialData?.pitakId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Assign Workers" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Select Workers *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <WorkerSelect
                value={currentWorkerId}
                onChange={handleWorkerSelect}
                placeholder="Select a worker to add"
              />
            </div>
            <Button type="button" variant="secondary" onClick={addWorker}>
              Add
            </Button>
          </div>
          {selectedWorkers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center gap-1 px-2 py-1 bg-[var(--card-secondary-bg)] rounded-full text-sm">
                  {worker.name}
                  <button type="button" onClick={() => removeWorker(worker.id)} className="text-red-500 hover:text-red-700 ml-1">
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
            disabled={isPlotLocked}
          />
          {isPlotLocked && initialData?.pitakLocation && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Assigning workers to plot: <strong>{initialData.pitakLocation}</strong>
            </p>
          )}
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
          <Button
            variant="primary"
            type="submit"
            loading={submitting}
            disabled={!defaultSessionId}
          >
            Assign {selectedWorkers.length} Worker{selectedWorkers.length !== 1 ? "s" : ""}
          </Button>
        </div>
        {!defaultSessionId && (
          <p className="text-xs text-red-500 mt-1">No default session configured. Please set a default session in system settings.</p>
        )}
      </form>
    </Modal>
  );
};

export default BulkAssignModal;
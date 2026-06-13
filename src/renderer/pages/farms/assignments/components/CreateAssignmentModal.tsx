// src/renderer/pages/farms/assignments/components/CreateAssignmentModal.tsx
import React, { useEffect, useState } from "react";
import type { AssignmentFormData } from "../types";
import assignmentAPI from "../../../../api/core/assignment";
import Modal from "../../../../components/UI/Modal";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import PitakSelect from "../../../../components/Selects/PitakSelect";
import Button from "../../../../components/UI/Button";
import { showWarning } from "../../../../utils/notification";
import { useDefaultSessionId } from "../../../../utils/config/farmConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (AssignmentFormData & { id?: number }) | null;
}

const CreateAssignmentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultSessionId = useDefaultSessionId();
  const [form, setForm] = useState<AssignmentFormData>({
    workerId: 0,
    pitakId: 0,
    sessionId: defaultSessionId || 0,
    assignmentDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        workerId: initialData.workerId,
        pitakId: initialData.pitakId,
        sessionId: initialData.sessionId,
        assignmentDate: initialData.assignmentDate,
        notes: initialData.notes || "",
        status: initialData.status || "active",
      });
    } else if (defaultSessionId) {
      setForm((prev) => ({ ...prev, sessionId: defaultSessionId, status: "active" }));
    }
  }, [initialData, isOpen, defaultSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workerId || !form.pitakId) {
      showWarning("Please select both worker and plot.");
      return;
    }
    if (!form.sessionId) {
      showWarning("No default session configured. Please set a default session in system settings.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        workerId: form.workerId,
        pitakId: form.pitakId,
        sessionId: form.sessionId,
        assignmentDate: form.assignmentDate,
        notes: form.notes || undefined,
        status: initialData?.id ? form.status : "active",
      };
      if (initialData?.id) {
        await assignmentAPI.update(initialData.id, payload);
      } else {
        await assignmentAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save assignment", error);
      showWarning("Failed to save assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Assignment" : "New Assignment"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Worker *</label>
          <WorkerSelect
            value={form.workerId}
            onChange={(id) => setForm({ ...form, workerId: id || 0 })}
            placeholder="Select worker"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Plot *</label>
          <PitakSelect
            value={form.pitakId}
            onChange={(id) => setForm({ ...form, pitakId: id || 0 })}
            placeholder="Select plot"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assignment Date *</label>
          <input
            type="date"
            value={form.assignmentDate}
            onChange={(e) => setForm({ ...form, assignmentDate: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting} disabled={!defaultSessionId}>
            {initialData?.id ? "Update" : "Create"}
          </Button>
        </div>
        {!defaultSessionId && (
          <p className="text-xs text-red-500 mt-1">No default session configured. Please set a default session in system settings.</p>
        )}
      </form>
    </Modal>
  );
};

export default CreateAssignmentModal;
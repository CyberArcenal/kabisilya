// src/renderer/pages/system/sessions/components/CreateSessionModal.tsx
import React, { useEffect, useState } from "react";
import type { SessionFormData } from "../types";
import sessionAPI, {
  type SessionCreateData,
} from "../../../../api/core/session";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import { showWarning, showError } from "../../../../utils/notification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (SessionCreateData & { id?: number }) | null;
}

const seasonOptions = [
  { value: "Tag-ulan", label: "Tag-ulan (Rainy)" },
  { value: "Tag-araw", label: "Tag-araw (Dry)" },
  { value: "Custom", label: "Custom" },
];

const CreateSessionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form, setForm] = useState<SessionCreateData>({
    name: "",
    year: new Date().getFullYear(),
    startDate: "",
    endDate: "",
    seasonType: "",
    status: "closed", // default for new sessions
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        year: initialData.year,
        startDate: initialData.startDate,
        endDate: initialData.endDate || "",
        seasonType: initialData.seasonType || "",
        status: initialData.status, // keep original for edit
        notes: initialData.notes || "",
      });
    } else {
      setForm({
        name: "",
        year: new Date().getFullYear(),
        startDate: "",
        endDate: "",
        seasonType: "",
        status: "closed",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showWarning("Please enter a session name.");
      return;
    }
    if (!form.startDate) {
      showWarning("Please select a start date.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        year: form.year,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        seasonType: form.seasonType || undefined,
        status: initialData?.id ? form.status : "closed", // force initiated on create
        notes: form.notes || undefined,
      };
      if (initialData?.id) {
        await sessionAPI.update(initialData.id, payload);
      } else {
        await sessionAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save session", error);
      showError(error.message || "Failed to save session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? "Edit Session" : "Add Session"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Year *
          </label>
          <input
            type="number"
            value={form.year}
            onChange={(e) =>
              setForm({
                ...form,
                year: parseInt(e.target.value) || new Date().getFullYear(),
              })
            }
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Start Date *
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            End Date
          </label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Season Type
          </label>
          <select
            value={form.seasonType}
            onChange={(e) => setForm({ ...form, seasonType: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select season type</option>
            {seasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {initialData?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSessionModal;

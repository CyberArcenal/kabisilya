// src/renderer/pages/farms/pitak/components/PitakFormModal.tsx
import React, { useEffect, useState } from "react";
import type { PitakFormData } from "../types";
import pitakAPI from "../../../../api/core/pitak";
import BukidSelect from "../../../../components/Selects/BukidSelect";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (PitakFormData & { id?: number }) | null;  // ← allow null, id optional
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const PitakFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState<PitakFormData>({
    bukidId: 0,
    location: "",
    area: undefined,
    description: "",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        bukidId: initialData.bukidId,
        location: initialData.location || "",
        area: initialData.area,
        description: initialData.description || "",
        status: initialData.status,
      });
    } else {
      setForm({
        bukidId: 0,
        location: "",
        area: undefined,
        description: "",
        status: "active",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bukidId) return;
    setSubmitting(true);
    try {
      const payload = {
        bukidId: form.bukidId,
        location: form.location || undefined,
        area: form.area,
        description: form.description || undefined,
        status: form.status as "active" | "completed" | "cancelled" | undefined,
      };
      if (initialData?.id) {
        await pitakAPI.update(initialData.id, payload);
      } else {
        await pitakAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save pitak", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Plot" : "Add Plot"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... rest of the form same as before ... */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Farm *</label>
          <BukidSelect
            value={form.bukidId}
            onChange={(id) => setForm({ ...form, bukidId: id || 0 })}
            placeholder="Select farm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Auto‑generate if empty"
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Area (sqm)</label>
          <input
            type="number"
            step="0.01"
            value={form.area ?? ""}
            onChange={(e) => setForm({ ...form, area: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {initialData?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PitakFormModal;
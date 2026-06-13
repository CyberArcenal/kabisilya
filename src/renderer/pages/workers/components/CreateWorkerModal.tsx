// src/renderer/pages/workers/components/CreateWorkerModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { WorkerFormData } from "../types";
import workerAPI from "../../../api/core/worker";
import { showWarning, showError } from "../../../utils/notification";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (WorkerFormData & { id?: number }) | null;
}

const CreateWorkerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState<WorkerFormData>({
    name: "",
    contact: "",
    email: "",
    address: "",
    status: "active", // default for new workers
    hireDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        contact: initialData.contact || "",
        email: initialData.email || "",
        address: initialData.address || "",
        status: initialData.status, // keep original status for edit
        hireDate: initialData.hireDate || "",
      });
    } else {
      setForm({
        name: "",
        contact: "",
        email: "",
        address: "",
        status: "active",
        hireDate: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showWarning("Please enter the worker's full name.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        contact: form.contact?.trim() || undefined,
        email: form.email?.trim() || undefined,
        address: form.address?.trim() || undefined,
        status: initialData?.id ? form.status : "active", // force active on create
        hireDate: form.hireDate || undefined,
      };
      if (initialData?.id) {
        await workerAPI.update(initialData.id, payload);
      } else {
        await workerAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save worker", error);
      showError(error.message || "Failed to save worker. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Worker" : "Add Worker"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Contact Number</label>
          <input
            type="tel"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Hire Date</label>
          <input
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
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

export default CreateWorkerModal;
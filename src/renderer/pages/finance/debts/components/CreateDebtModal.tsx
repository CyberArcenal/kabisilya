// src/renderer/pages/finance/debts/components/CreateDebtModal.tsx
import React, { useEffect, useState } from "react";
import type { DebtFormData } from "../types";
import debtAPI from "../../../../api/core/debt";
import Modal from "../../../../components/UI/Modal";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import Button from "../../../../components/UI/Button";
import { showWarning } from "../../../../utils/notification";
import { useDefaultSessionId } from "../../../../utils/config/farmConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (DebtFormData & { id?: number }) | null;
}

const CreateDebtModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultSessionId = useDefaultSessionId();
  const [form, setForm] = useState<DebtFormData>({
    workerId: 0,
    sessionId: defaultSessionId || 0,
    amount: 0,
    dueDate: "",
    interestRate: 0,
    reason: "",
    status: "pending", // always pending for new, kept for edit
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          workerId: initialData.workerId || 0,
          sessionId: initialData.sessionId || 0,
          amount: initialData.amount || 0,
          dueDate: initialData.dueDate || "",
          interestRate: initialData.interestRate || 0,
          reason: initialData.reason || "",
          status: initialData.status || "pending",
        });
      } else if (defaultSessionId) {
        setForm(prev => ({ ...prev, sessionId: defaultSessionId, status: "pending" }));
      } else {
        setForm(prev => ({ ...prev, sessionId: 0, status: "pending" }));
      }
    }
  }, [isOpen, initialData, defaultSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workerId) {
      showWarning("Please select a worker.");
      return;
    }
    if (!form.sessionId) {
      showWarning("No default session configured. Please set a default session in system settings.");
      return;
    }
    if (form.amount <= 0) {
      showWarning("Amount must be greater than zero.");
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        workerId: form.workerId,
        sessionId: form.sessionId,
        amount: form.amount,
        dueDate: form.dueDate || undefined,
        interestRate: form.interestRate || undefined,
        reason: form.reason || undefined,
        status: initialData?.id ? form.status : "pending", // force pending on create
      };
      if (initialData?.id) {
        await debtAPI.update(initialData.id, payload);
      } else {
        await debtAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save debt", error);
      showWarning("Failed to save debt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Debt" : "Create Debt"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Worker *</label>
          <WorkerSelect value={form.workerId} onChange={(id) => setForm({ ...form, workerId: id || 0 })} placeholder="Select worker" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (₱) *</label>
          <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Interest Rate (%)</label>
          <input type="number" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason</label>
          <textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
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

export default CreateDebtModal;
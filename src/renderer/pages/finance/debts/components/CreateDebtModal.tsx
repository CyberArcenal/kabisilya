// src/renderer/pages/finance/debts/components/CreateDebtModal.tsx
import React, { useEffect, useState } from "react";
import type { DebtFormData } from "../types";
import debtAPI from "../../../../api/core/debt";
import Modal from "../../../../components/UI/Modal";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import SessionSelect from "../../../../components/Selects/SessionSelect";
import Button from "../../../../components/UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (DebtFormData & { id?: number }) | null;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "overdue", label: "Overdue" },
  { value: "settled", label: "Settled" },
];

const CreateDebtModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState<DebtFormData>({
    workerId: 0,
    sessionId: 0,
    amount: 0,
    dueDate: "",
    interestRate: 0,
    reason: "",
    status: "pending",
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
      } else {
        setForm({
          workerId: 0,
          sessionId: 0,
          amount: 0,
          dueDate: "",
          interestRate: 0,
          reason: "",
          status: "pending",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workerId || !form.sessionId || form.amount <= 0) return;
    setSubmitting(true);
    try {
      const payload: any = {
        workerId: form.workerId,
        sessionId: form.sessionId,
        amount: form.amount,
        dueDate: form.dueDate || undefined,
        interestRate: form.interestRate || undefined,
        reason: form.reason || undefined,
        status: form.status as any,
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Session *</label>
          <SessionSelect value={form.sessionId} onChange={(id) => setForm({ ...form, sessionId: id || 0 })} placeholder="Select session" />
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
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={submitting}>{initialData?.id ? "Update" : "Create"}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateDebtModal;
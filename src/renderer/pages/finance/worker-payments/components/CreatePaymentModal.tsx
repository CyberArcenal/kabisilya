// src/renderer/pages/finance/worker-payments/components/CreatePaymentModal.tsx
import React, { useEffect, useState } from "react";
import type { PaymentFormData } from "../types";
import paymentAPI from "../../../../api/core/payment";
import Modal from "../../../../components/UI/Modal";
import PitakSelect from "../../../../components/Selects/PitakSelect";
import SessionSelect from "../../../../components/Selects/SessionSelect";
import AssignmentSelect from "../../../../components/Selects/AssignmentSelect";
import Button from "../../../../components/UI/Button";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (PaymentFormData & { id?: number }) | null;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CreatePaymentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState<PaymentFormData>({
    workerId: 0,
    pitakId: 0,
    sessionId: 0,
    assignmentId: null,
    amount: 0,
    manualDeduction: 0,
    netPay: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        workerId: initialData.workerId,
        pitakId: initialData.pitakId,
        sessionId: initialData.sessionId,
        assignmentId: initialData.assignmentId,
        amount: initialData.amount,
        manualDeduction: initialData.manualDeduction || 0,
        netPay: initialData.netPay || initialData.amount - (initialData.manualDeduction || 0),
        paymentDate: initialData.paymentDate || new Date().toISOString().split("T")[0],
        notes: initialData.notes || "",
        status: initialData.status || "pending",
      });
    } else {
      setForm({
        workerId: 0,
        pitakId: 0,
        sessionId: 0,
        assignmentId: null,
        amount: 0,
        manualDeduction: 0,
        netPay: 0,
        paymentDate: new Date().toISOString().split("T")[0],
        notes: "",
        status: "pending",
      });
    }
  }, [initialData, isOpen]);

  // Auto-calculate netPay when amount or deduction changes
  useEffect(() => {
    const net = (form.amount || 0) - (form.manualDeduction || 0);
    setForm(prev => ({ ...prev, netPay: net < 0 ? 0 : net }));
  }, [form.amount, form.manualDeduction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workerId || !form.pitakId || !form.sessionId || form.amount <= 0) return;
    setSubmitting(true);
    try {
      const payload = {
        workerId: form.workerId,
        pitakId: form.pitakId,
        sessionId: form.sessionId,
        assignmentId: form.assignmentId || undefined,
        amount: form.amount,
        manualDeduction: form.manualDeduction,
        netPay: form.netPay,
        paymentDate: form.paymentDate,
        notes: form.notes || undefined,
        status: form.status as "pending" | "partially_paid" | "completed" | "cancelled" | undefined,
      };
      if (initialData?.id) {
        await paymentAPI.update(initialData.id, payload);
      } else {
        await paymentAPI.create(payload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save payment", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "Edit Payment" : "Create Payment"} size="md">
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Session *</label>
          <SessionSelect
            value={form.sessionId}
            onChange={(id) => setForm({ ...form, sessionId: id || 0 })}
            placeholder="Select session"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Assignment (optional)</label>
          <AssignmentSelect
            value={form.assignmentId || null}
            onChange={(id) => setForm({ ...form, assignmentId: id })}
            workerFilter={form.workerId || undefined}
            pitakFilter={form.pitakId || undefined}
            placeholder="Select assignment (auto-filters by worker & plot)"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Gross Pay (₱) *</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Manual Deduction (₱)</label>
            <input
              type="number"
              step="0.01"
              value={form.manualDeduction}
              onChange={(e) => setForm({ ...form, manualDeduction: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Net Pay (₱)</label>
          <input
            type="number"
            step="0.01"
            value={form.netPay}
            readOnly
            className="w-full px-3 py-2 rounded-lg border bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            style={{ color: "var(--text-primary)" }}
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Auto-calculated: Gross Pay - Deductions</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Payment Date *</label>
          <input
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
            required
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
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
          <Button variant="primary" type="submit" loading={submitting}>
            {initialData?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePaymentModal;
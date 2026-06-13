// src/renderer/pages/finance/worker-payments/components/CreatePaymentModal.tsx
import React, { useEffect, useState } from "react";
import type { PaymentFormData } from "../types";
import paymentAPI from "../../../../api/core/payment";
import Modal from "../../../../components/UI/Modal";
import PitakSelect from "../../../../components/Selects/PitakSelect";
import AssignmentSelect from "../../../../components/Selects/AssignmentSelect";
import Button from "../../../../components/UI/Button";
import WorkerSelect from "../../../../components/Selects/WorkerSelect";
import { showWarning } from "../../../../utils/notification";
import { useDefaultSessionId } from "../../../../utils/config/farmConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: (PaymentFormData & { id?: number }) | null;
}

const CreatePaymentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultSessionId = useDefaultSessionId();
  const [form, setForm] = useState<PaymentFormData>({
    workerId: 0,
    pitakId: 0,
    sessionId: defaultSessionId || 0,
    assignmentId: null,
    amount: 0,
    manualDeduction: 0,
    netPay: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
    status: "pending", // always pending for new, kept for edit
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
    } else if (defaultSessionId) {
      setForm(prev => ({ ...prev, sessionId: defaultSessionId, status: "pending" }));
    } else {
      setForm(prev => ({ ...prev, sessionId: 0, status: "pending" }));
    }
  }, [initialData, isOpen, defaultSessionId]);

  // Auto-calculate netPay
  useEffect(() => {
    const net = (form.amount || 0) - (form.manualDeduction || 0);
    setForm(prev => ({ ...prev, netPay: net < 0 ? 0 : net }));
  }, [form.amount, form.manualDeduction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workerId) {
      showWarning("Please select a worker.");
      return;
    }
    if (!form.pitakId) {
      showWarning("Please select a plot.");
      return;
    }
    if (!form.sessionId) {
      showWarning("No default session configured. Please set a default session in system settings.");
      return;
    }
    if (form.amount <= 0) {
      showWarning("Gross pay must be greater than zero.");
      return;
    }
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
        status: initialData?.id ? form.status as "pending" | "partially_paid" | "completed" | "cancelled" | undefined : "pending", // force pending on create
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
      showWarning("Failed to save payment. Please try again.");
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

export default CreatePaymentModal;
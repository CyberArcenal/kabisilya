// src/renderer/pages/workers/components/ViewWorkerModal.tsx
import React, { useState } from "react";
import Modal from "../../../components/UI/Modal";
import Button from "../../../components/UI/Button";
import type { WorkerWithDetails } from "../types";
import assignmentAPI from "../../../api/core/assignment";
import paymentAPI from "../../../api/core/payment";
import debtAPI from "../../../api/core/debt";


interface Props {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerWithDetails | null;
}

type TabType = "assignments" | "payments" | "debts";

const ViewWorkerModal: React.FC<Props> = ({ isOpen, onClose, worker }) => {
  const [activeTab, setActiveTab] = useState<TabType>("assignments");
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);

  React.useEffect(() => {
    if (!worker || !isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentsRes, paymentsRes, debtsRes] = await Promise.all([
          assignmentAPI.getAll({ workerId: worker.id, limit: 100 }),
          paymentAPI.getAll({ workerId: worker.id, limit: 100 }),
          debtAPI.getAll({ workerId: worker.id, limit: 100 }),
        ]);
        if (assignmentsRes.status) setAssignments(assignmentsRes.data.items);
        if (paymentsRes.status) setPayments(paymentsRes.data.items);
        if (debtsRes.status) setDebts(debtsRes.data.items);
      } catch (error) {
        console.error("Failed to fetch worker data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [worker, isOpen]);

  if (!worker) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Worker Details" size="lg">
      <div className="space-y-5">
        {/* Worker basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Name</label>
            <p className="text-[var(--text-primary)] font-medium">{worker.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{worker.status}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Contact</label>
            <p>{worker.contact || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Email</label>
            <p>{worker.email || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Address</label>
            <p>{worker.address || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Hire Date</label>
            <p>{worker.hireDate ? new Date(worker.hireDate).toLocaleDateString() : "—"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border-color)]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === "assignments" ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Assignments
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === "payments" ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("debts")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${activeTab === "debts" ? "text-[var(--primary-color)] border-b-2 border-[var(--primary-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
            >
              Debts
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-h-80 overflow-y-auto">
          {loading && <div className="p-4 text-center text-[var(--text-tertiary)]">Loading...</div>}
          {!loading && activeTab === "assignments" && (
            assignments.length === 0 ? (
              <p className="p-4 text-center text-[var(--text-tertiary)]">No assignments found</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--card-secondary-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-left">Plot</th>
                    <th className="px-3 py-2 text-left">Luwang</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">{a.pitak?.location || "—"}</td>
                      <td className="px-3 py-2">{a.luwangCount}</td>
                      <td className="px-3 py-2">{new Date(a.assignmentDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2 capitalize">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
          {!loading && activeTab === "payments" && (
            payments.length === 0 ? (
              <p className="p-4 text-center text-[var(--text-tertiary)]">No payments found</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--card-secondary-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Gross Pay</th>
                    <th className="px-3 py-2 text-left">Net Pay</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">{formatCurrency(p.grossPay)}</td>
                      <td className="px-3 py-2">{formatCurrency(p.netPay)}</td>
                      <td className="px-3 py-2 capitalize">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
          {!loading && activeTab === "debts" && (
            debts.length === 0 ? (
              <p className="p-4 text-center text-[var(--text-tertiary)]">No debts found</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[var(--card-secondary-bg)]">
                  <tr>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Balance</th>
                    <th className="px-3 py-2 text-left">Due Date</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((d) => (
                    <tr key={d.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">{formatCurrency(d.amount)}</td>
                      <td className="px-3 py-2">{formatCurrency(d.balance)}</td>
                      <td className="px-3 py-2">{d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2 capitalize">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewWorkerModal;
// src/renderer/pages/system/sessions/components/ViewSessionModal.tsx
import React from "react";
import type { SessionWithDetails } from "../types";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: SessionWithDetails | null;
}

const ViewSessionModal: React.FC<Props> = ({ isOpen, onClose, session }) => {
  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Session Details" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Name</label>
            <p className="text-[var(--text-primary)] font-medium">{session.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Year</label>
            <p>{session.year}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Season Type</label>
            <p>{session.seasonType || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{session.status}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Start Date</label>
            <p>{new Date(session.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">End Date</label>
            <p>{session.endDate ? new Date(session.endDate).toLocaleDateString() : "—"}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Notes</label>
            <p>{session.notes || "—"}</p>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Statistics</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--card-secondary-bg)] p-3 rounded-lg">
              <p className="text-sm text-[var(--text-tertiary)]">Total Bukids</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{session.totalBukids ?? 0}</p>
            </div>
            <div className="bg-[var(--card-secondary-bg)] p-3 rounded-lg">
              <p className="text-sm text-[var(--text-tertiary)]">Total Assignments</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{session.totalAssignments ?? 0}</p>
            </div>
            <div className="bg-[var(--card-secondary-bg)] p-3 rounded-lg">
              <p className="text-sm text-[var(--text-tertiary)]">Total Payments</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{session.totalPayments ?? 0}</p>
            </div>
            <div className="bg-[var(--card-secondary-bg)] p-3 rounded-lg">
              <p className="text-sm text-[var(--text-tertiary)]">Total Debts</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{session.totalDebts ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewSessionModal;
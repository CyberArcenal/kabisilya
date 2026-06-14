// src/renderer/pages/farms/pitak/components/PitakViewModal.tsx
import React from "react";
import type { PitakWithWorkers } from "../types";
import WorkerAvatarStack from "./WorkerAvatarStack";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import type { Worker } from "../../../../api/core/worker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pitak: PitakWithWorkers | null;
  onWorkerClick: (worker: Worker) => void;
}

const PitakViewModal: React.FC<Props> = ({ isOpen, onClose, pitak, onWorkerClick }) => {
  if (!pitak) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plot Details" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Location</label>
            <p className="text-[var(--text-primary)] font-medium">{pitak.location}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{pitak.status}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Farm</label>
            <p>{pitak.bukid?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Luwang</label>
            <p>{pitak.totalLuwang ?? "—"}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Description</label>
            <p className="whitespace-pre-wrap">{pitak.description || "—"}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Assigned Workers</label>
          {(!pitak.workers || pitak.workers.length === 0) ? (
            <p className="text-sm text-[var(--text-tertiary)]">No workers assigned</p>
          ) : (
            <WorkerAvatarStack workers={pitak.workers} onWorkerClick={onWorkerClick} pitakId={pitak.id} />
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PitakViewModal;
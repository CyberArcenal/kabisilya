// src/renderer/pages/farms/pitak/components/ViewPitakModal.tsx
import React from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import type { PitakWithWorkers } from "../types";
import WorkerAvatarStack from "./WorkerAvatarStack";
import type { Worker } from "../../../../api/core/worker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pitak: PitakWithWorkers | null;
  onWorkerClick: (worker: Worker) => void;
}

const ViewPitakModal: React.FC<Props> = ({ isOpen, onClose, pitak, onWorkerClick }) => {
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
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Area (sqm)</label>
            <p>{pitak.area ?? "—"}</p>
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
            <div className="flex flex-wrap gap-2">
              {pitak.workers.map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => onWorkerClick(worker)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card-secondary-bg)] border border-[var(--border-color)] cursor-pointer hover:bg-[var(--card-hover-bg)] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xs font-medium">
                    {worker.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{worker.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPitakModal;
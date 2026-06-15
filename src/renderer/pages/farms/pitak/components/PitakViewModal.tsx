// src/renderer/pages/farms/pitak/components/PitakViewModal.tsx
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";
import assignmentAPI, { type Assignment } from "../../../../api/core/assignment";
import type { Worker } from "../../../../api/core/worker";
import type { PitakWithWorkers } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pitak: PitakWithWorkers | null;
  onWorkerClick: (worker: Worker) => void;
}

interface AssignmentWithWorker extends Assignment {
  worker: Worker;
}

const PitakViewModal: React.FC<Props> = ({ isOpen, onClose, pitak, onWorkerClick }) => {
  const [assignments, setAssignments] = useState<AssignmentWithWorker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback workers from hydrated prop
  const fallbackWorkers = pitak?.workers || [];

  useEffect(() => {
    if (!isOpen || !pitak?.id) return;

    const fetchAssignments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await assignmentAPI.getAll({
          pitakId: pitak.id,
          limit: 100,
        });
        if (res.status && res.data.items) {
          const validAssignments = res.data.items.filter(
            (a): a is AssignmentWithWorker => a.worker !== undefined && a.worker !== null
          );
          setAssignments(validAssignments);
        } else {
          setError(res.message || "Failed to load assignments");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [isOpen, pitak?.id]);

  if (!pitak) return null;

  const displayWorkers =
    assignments.length > 0 ? assignments.map(a => a.worker) : fallbackWorkers;

  // Theme‑aware status color using CSS variables
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[var(--status-success-bg)] text-[var(--status-success-text)]";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "initiated":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Plot Details" size="lg">
      <div className="space-y-6">
        {/* Plot Information – all using CSS variables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--card-secondary-bg)]">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Location
            </label>
            <p className="text-[var(--text-primary)] font-semibold text-lg">{pitak.location}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Status
            </label>
            <p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(pitak.status)}`}>
                {pitak.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Farm (Bukid)
            </label>
            <p className="text-[var(--text-primary)]">{pitak.bukid?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Total Luwang
            </label>
            <p className="text-[var(--text-primary)] font-medium">{pitak.totalLuwang ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Description
            </label>
            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {pitak.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Assigned Workers Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              👥 Assigned Workers
              {!loading && displayWorkers.length > 0 && (
                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-0.5 rounded-full">
                  {displayWorkers.length}
                </span>
              )}
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 rounded-lg">
              ⚠️ {error}
              {fallbackWorkers.length > 0 && (
                <div className="mt-2 text-xs text-[var(--text-tertiary)]">Showing cached data instead.</div>
              )}
            </div>
          ) : displayWorkers.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)] border border-dashed border-[var(--border-color)] rounded-lg">
              No workers currently assigned to this plot.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {displayWorkers.map((worker) => {
                const assignment = assignments.find(a => a.worker?.id === worker.id);
                return (
                  <div
                    key={worker.id}
                    onClick={() => onWorkerClick(worker)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white font-bold shadow-sm">
                      {worker.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary-color)] transition">
                        {worker.name}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-tertiary)]">
                        {worker.contact && (
                          <span className="flex items-center gap-1">📞 {worker.contact}</span>
                        )}
                        {assignment && (
                          <>
                            <span className="flex items-center gap-1">🌾 Luwang: {assignment.luwangCount}</span>
                            <span className={`capitalize ${getStatusClass(assignment.status)} px-1.5 py-0.5 rounded text-[11px]`}>
                              {assignment.status}
                            </span>
                          </>
                        )}
                        {!assignment && (
                          <span className="text-xs text-[var(--text-tertiary)]">No active assignment</span>
                        )}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition">
                      <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PitakViewModal;
import React, { useState, useEffect } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import LoadingSpinner from "../../../../components/Shared/LoadingSpinner";
import sessionAPI from "../../../../api/core/session";
import bukidAPI from "../../../../api/core/bukid";
import type { Session } from "../../../../api/core/session";
import type { Bukid } from "../../../../api/core/bukid";
import { showSuccess, showError } from "../../../../utils/notification";
import Switch from "../../../../components/UI/Switch";

interface CopyFarmStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CopyFarmStructureModal: React.FC<CopyFarmStructureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sourceSessionId, setSourceSessionId] = useState<number | null>(null);
  const [targetSessionId, setTargetSessionId] = useState<number | null>(null);
  const [bukids, setBukids] = useState<Bukid[]>([]);
  const [selectedBukidIds, setSelectedBukidIds] = useState<number[]>([]);
  const [includeAssignments, setIncludeAssignments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all sessions on mount
  useEffect(() => {
    if (isOpen) {
      sessionAPI.getAll({ limit: 1000 }).then((res) => {
        if (res.status) {
          setSessions(res.data.items);
        }
      });
    }
  }, [isOpen]);

  // Fetch bukids when source session changes
  useEffect(() => {
    if (sourceSessionId) {
      bukidAPI
        .getAll({ sessionId: sourceSessionId, limit: 1000 })
        .then((res) => {
          if (res.status) {
            setBukids(res.data.items);
            // Reset selection
            setSelectedBukidIds([]);
          }
        });
    } else {
      setBukids([]);
      setSelectedBukidIds([]);
    }
  }, [sourceSessionId]);

  const handleSubmit = async () => {
    if (!sourceSessionId || !targetSessionId) {
      showError("Please select both source and target sessions.");
      return;
    }
    if (sourceSessionId === targetSessionId) {
      showError("Source and target sessions must be different.");
      return;
    }
    if (selectedBukidIds.length === 0) {
      showError("Please select at least one Bukid to copy.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await sessionAPI.copyFarmStructure(
        sourceSessionId,
        targetSessionId,
        selectedBukidIds,
        includeAssignments,
      );
      if (result.status) {
        showSuccess(
          `Successfully copied ${result.data.copiedBukids} Bukids, ${result.data.copiedPitaks} Pitaks, and ${result.data.copiedAssignments} Assignments.`,
        );
        onSuccess();
        onClose();
      } else {
        showError(result.message || "Failed to copy farm structure.");
      }
    } catch (error: any) {
      showError(error.message || "An error occurred while copying.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBukid = (bukidId: number) => {
    setSelectedBukidIds((prev) =>
      prev.includes(bukidId)
        ? prev.filter((id) => id !== bukidId)
        : [...prev, bukidId],
    );
  };

  const handleSelectAllBukids = () => {
    if (selectedBukidIds.length === bukids.length) {
      setSelectedBukidIds([]);
    } else {
      setSelectedBukidIds(bukids.map((b) => b.id));
    }
  };

  const sourceOptions = sessions.filter((s) => s.id !== targetSessionId);
  const targetOptions = sessions.filter((s) => s.id !== sourceSessionId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy Farm Structure"
      size="lg"
    >
      <div className="space-y-4">
        {/* Source Session */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Source Session *
          </label>
          <select
            value={sourceSessionId ?? ""}
            onChange={(e) => setSourceSessionId(Number(e.target.value) || null)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select source session</option>
            {sourceOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.year})
              </option>
            ))}
          </select>
        </div>

        {/* Target Session */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Target Session *
          </label>
          <select
            value={targetSessionId ?? ""}
            onChange={(e) => setTargetSessionId(Number(e.target.value) || null)}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select target session</option>
            {targetOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.year})
              </option>
            ))}
          </select>
        </div>

        {/* Bukid selection */}
        {sourceSessionId && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Select Bukids to Copy *
              </label>
              <button
                onClick={handleSelectAllBukids}
                className="text-xs text-[var(--primary-color)] hover:underline"
              >
                {selectedBukidIds.length === bukids.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            {bukids.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">
                No Bukids found in this session.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-[var(--border-color)] rounded-lg p-2">
                {bukids.map((bukid) => (
                  <label
                    key={bukid.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-[var(--card-hover-bg)] rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBukidIds.includes(bukid.id)}
                      onChange={() => handleToggleBukid(bukid.id)}
                      className="rounded border-[var(--border-color)]"
                    />
                    <span className="text-sm">{bukid.name}</span>
                    <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                      {bukid.pitaks?.length || 0} pitaks
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {selectedBukidIds.length} of {bukids.length} selected
            </p>
          </div>
        )}

        {/* Include Assignments */}
        <div className="flex items-center gap-3">
          <Switch
            checked={includeAssignments}
            onChange={setIncludeAssignments}
          />
          <label
            htmlFor="includeAssignments"
            className="text-sm text-[var(--text-secondary)] cursor-pointer"
          >
            Include Assignments (workers and luWang counts)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={
              !sourceSessionId ||
              !targetSessionId ||
              selectedBukidIds.length === 0
            }
          >
            Copy Structure
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CopyFarmStructureModal;

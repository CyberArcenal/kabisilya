// src/renderer/pages/system/settings/components/farm-settings/SessionSettings.tsx
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import type { FarmSessionSettings } from "../../../../../api/utils/system_config";
import sessionAPI, { type Session } from "../../../../../api/core/session";
import { showSuccess, showError } from "../../../../../utils/notification";

interface SessionSettingsProps {
  settings: FarmSessionSettings;
  onChange: (field: keyof FarmSessionSettings, value: any) => void;
  onCreateSession: () => void;
}

export const SessionSettings: React.FC<SessionSettingsProps> = ({
  settings,
  onChange,
  onCreateSession,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await sessionAPI.getAll({
        sortBy: "startDate",
        sortOrder: "DESC",
        limit: 100,
      });
      if (response.status && response.data) {
        setSessions(response.data.items);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleSessionChange = (sessionId: number | undefined) => {
    onChange("default_session_id", sessionId);
  };

  const handleActivate = async () => {
    const defaultId = settings.default_session_id;
    if (!defaultId) {
      showError("Please select a default session first.");
      return;
    }
    setActivating(true);
    try {
      await sessionAPI.updateStatus(defaultId, "active");
      showSuccess("Default session activated successfully!");
      // Optionally refresh session list to reflect status change
      await loadSessions();
    } catch (error: any) {
      showError(error.message || "Failed to activate session");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-md">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Default Session
        </label>
        {loadingSessions ? (
          <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary-color)]"></div>
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              No sessions found. Please create a session first.
            </p>
            <button
              type="button"
              onClick={onCreateSession}
              className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 underline hover:opacity-80"
            >
              Create New Session
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <select
              value={settings.default_session_id || ""}
              onChange={(e) =>
                handleSessionChange(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="flex-1 px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="">Select a session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.year}) - {session.status}
                </option>
              ))}
            </select>
            <button
              onClick={handleActivate}
              disabled={!settings.default_session_id || activating}
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {activating ? "Activating..." : "Activate"}
            </button>
          </div>
        )}
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          The default session for farm operations. Activate to set status to active.
        </p>
      </div>
    </div>
  );
};
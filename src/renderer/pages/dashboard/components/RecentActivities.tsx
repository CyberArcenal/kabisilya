// src/renderer/pages/dashboard/components/RecentActivities.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import type { AuditLogEntry } from "../../../api/core/audit";

interface Props {
  activities: AuditLogEntry[];
}

const RecentActivities: React.FC<Props> = ({ activities }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activities</h3>
        <button onClick={() => navigate("/audit")} className="text-sm text-[var(--primary-color)] hover:underline">
          View all
        </button>
      </div>
      <div className="divide-y divide-[var(--border-color)]">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-[var(--text-tertiary)]">No recent activity</div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="px-6 py-3 flex items-center gap-3 hover:bg-[var(--card-hover-bg)] transition-colors">
              <Activity className="w-4 h-4 text-[var(--primary-color)]" />
              <div className="flex-1">
                <p className="text-sm text-[var(--text-primary)]">
                  <span className="font-medium">{activity.user || "System"}</span>{" "}
                  {activity.action} {activity.entity}
                  {activity.entityId ? ` #${activity.entityId}` : ""}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              {activity.description && (
                <div className="text-xs text-[var(--text-secondary)] max-w-md truncate">{activity.description}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
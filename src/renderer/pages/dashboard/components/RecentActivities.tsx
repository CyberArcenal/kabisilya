// src/renderer/pages/dashboard/components/RecentActivities.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Plus, Edit, Trash2, RefreshCw, Eye, Calendar, CreditCard, Users, MapPin } from "lucide-react";
import type { AuditLogEntry } from "../../../api/core/audit";

interface Props {
  activities: AuditLogEntry[];
}

const getActionIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add")) return <Plus className="w-3 h-3" />;
  if (a.includes("update") || a.includes("edit")) return <Edit className="w-3 h-3" />;
  if (a.includes("delete") || a.includes("remove")) return <Trash2 className="w-3 h-3" />;
  if (a.includes("restore")) return <RefreshCw className="w-3 h-3" />;
  if (a.includes("view")) return <Eye className="w-3 h-3" />;
  if (a.includes("complete")) return <Calendar className="w-3 h-3" />;
  if (a.includes("payment")) return <CreditCard className="w-3 h-3" />;
  if (a.includes("worker")) return <Users className="w-3 h-3" />;
  if (a.includes("pitak")) return <MapPin className="w-3 h-3" />;
  return <Activity className="w-3 h-3" />;
};

const getActionColor = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("create")) return "text-green-500";
  if (a.includes("update")) return "text-blue-500";
  if (a.includes("delete")) return "text-red-500";
  if (a.includes("restore")) return "text-purple-500";
  return "text-[var(--primary-color)]";
};

const RecentActivities: React.FC<Props> = ({ activities }) => {
  const navigate = useNavigate();

  if (activities.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6 text-center text-[var(--text-tertiary)]">
        No recent activity
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--primary-color)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activities</h3>
        </div>
        <button onClick={() => navigate("/audit")} className="text-sm text-[var(--primary-color)] hover:underline">
          View all
        </button>
      </div>
      <div className="divide-y divide-[var(--border-color)] max-h-80 overflow-y-auto">
        {activities.slice(0, 10).map((activity) => (
          <div key={activity.id} className="px-6 py-3 hover:bg-[var(--card-hover-bg)] transition-colors flex items-start gap-3">
            <div className={`p-1.5 rounded-full bg-[var(--card-secondary-bg)] ${getActionColor(activity.action)}`}>
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">{activity.user || "System"}</span>
                <span className="text-xs text-[var(--text-secondary)]">{activity.action}</span>
                <span className="text-xs text-[var(--text-tertiary)]">{activity.entity}</span>
                {activity.entityId && (
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">#{activity.entityId}</span>
                )}
              </div>
              {activity.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate max-w-lg">{activity.description}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Edit,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import type { AuditLogEntry } from "../../../api/core/audit";

const getActionIcon = (action: string) => {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add"))
    return <Plus className="w-3 h-3" />;
  if (a.includes("update") || a.includes("edit"))
    return <Edit className="w-3 h-3" />;
  if (a.includes("delete") || a.includes("remove"))
    return <Trash2 className="w-3 h-3" />;
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

const RecentActivities: React.FC<{
  activities: AuditLogEntry[];
  maxItems?: number;
}> = React.memo(({ activities, maxItems = 10 }) => {
  const navigate = useNavigate();
  const displayedActivities = useMemo(
    () => activities.slice(0, maxItems),
    [activities, maxItems],
  );

  if (displayedActivities.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-8 text-center text-[var(--text-tertiary)]">
        No recent activity
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--card-secondary-bg)]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--primary-color)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Recent Activities
          </h3>
        </div>
        <button
          onClick={() => navigate("/audit")}
          className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="divide-y divide-[var(--border-color)] max-h-96 overflow-y-auto custom-scrollbar">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            className="px-6 py-4 hover:bg-[var(--card-hover-bg)] transition-colors flex items-start gap-3"
          >
            <div
              className={`p-1.5 rounded-full bg-[var(--card-secondary-bg)] ${getActionColor(activity.action)}`}
            >
              {getActionIcon(activity.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {activity.user || "System"}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]">
                  {activity.action}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  {activity.entity}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RecentActivities;

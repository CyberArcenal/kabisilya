import React from "react";
import { Check, Trash2 } from "lucide-react";
import type { Notification } from "../../../api/core/notifications";

interface NotificationTableProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationTable: React.FC<NotificationTableProps> = ({ notifications, onMarkRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No notifications found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4">Title</th>
            <th className="text-left py-3 px-4">Message</th>
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-left py-3 px-4">Created At</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notif) => (
            <tr key={notif.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4 font-medium">{notif.title}</td>
              <td className="py-2.5 px-4 max-w-md truncate">{notif.message}</td>
              <td className="py-2.5 px-4 capitalize">{notif.type}</td>
              <td className="py-2.5 px-4">{new Date(notif.createdAt).toLocaleString()}</td>
              <td className="py-2.5 px-4">
                {notif.isRead ? (
                  <span className="text-xs text-gray-500">Read</span>
                ) : (
                  <span className="text-xs text-blue-500 font-medium">Unread</span>
                )}
              </td>
              <td className="py-2.5 px-4">
                <div className="flex gap-2">
                  {!notif.isRead && (
                    <button onClick={() => onMarkRead(notif.id)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Mark as read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => onDelete(notif.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotificationTable;
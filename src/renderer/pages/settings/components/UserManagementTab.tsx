// src/renderer/pages/settings/components/UserManagementTab.tsx
import React from "react";
import { Plus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import Button from "../../../components/UI/Button";
import type { User } from "../types";
import CreateUserModal from "./CreateUserModal";

interface Props {
  users: User[];
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
  editingUser: User | null;
  userModalOpen: boolean;
  onUserModalClose: () => void;
  onCreateUser: (userData: Omit<User, "id" | "createdAt">) => void;
  onUpdateUser: (id: number, userData: Partial<User>) => void;
}

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#fee2e2", text: "#991b1b" },
  manager: { bg: "#dbeafe", text: "#1e40af" },
  viewer: { bg: "#f3f4f6", text: "#6b7280" },
};

const UserManagementTab: React.FC<Props> = ({
  users,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  editingUser,
  userModalOpen,
  onUserModalClose,
  onCreateUser,
  onUpdateUser,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" icon={Plus} onClick={onAdd}>Add User</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
            <tr>
              <th className="text-left py-3 px-4">Username</th>
              <th className="text-left py-3 px-4">Full Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleColors = roleBadgeColors[user.role] || roleBadgeColors.viewer;
              return (
                <tr key={user.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
                  <td className="py-2.5 px-4 font-medium">{user.username}</td>
                  <td className="py-2.5 px-4">{user.fullName}</td>
                  <td className="py-2.5 px-4">{user.email}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: roleColors.bg, color: roleColors.text }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {user.isActive ? (
                      <span className="text-green-600 dark:text-green-400">Active</span>
                    ) : (
                      <span className="text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(user)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => onToggleActive(user.id)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--accent-green)]" title={user.isActive ? "Deactivate" : "Activate"}>
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button onClick={() => onDelete(user.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateUserModal
        isOpen={userModalOpen}
        onClose={onUserModalClose}
        onSuccess={onCreateUser}
        onUpdate={onUpdateUser}
        initialData={editingUser}
      />
    </div>
  );
};

export default UserManagementTab;
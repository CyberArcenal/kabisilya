// src/renderer/pages/system/sessions/components/SessionActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { Eye, Edit, GitBranch, Trash2, MoreVertical, Star } from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";
import type { SessionWithDetails } from "../types";

interface SessionActionsDropdownProps {
  session: SessionWithDetails;
  onView: (session: SessionWithDetails) => void;
  onEdit: (session: SessionWithDetails) => void;
  onDelete: (id: number) => void;
  onSetActive: (id: number) => void;
  onChangeStatus: (session: SessionWithDetails) => void;
}

const SessionActionsDropdown: React.FC<SessionActionsDropdownProps> = ({
  session,
  onView,
  onEdit,
  onDelete,
  onSetActive,
  onChangeStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const windowHeight = window.innerHeight;
    if (rect.bottom + dropdownHeight > windowHeight) {
      return {
        bottom: `${windowHeight - rect.top + 5}px`,
        right: `${window.innerWidth - rect.right}px`,
      };
    }
    return {
      top: `${rect.bottom + 5}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  };

  const isLocked = session.status === "archived" || session.status === "closed";
  const canSetActive = session.status !== "active";

  const handleDeleteClick = async () => {
    const confirmed = await dialogs.confirm({
      title: "Delete Session",
      message: `Are you sure you want to delete "${session.name}"? This will also delete all related data (farms, plots, assignments, payments, debts). This action cannot be undone.`,
    });
    if (!confirmed) return;
    handleAction(() => onDelete(session.id));
  };

  const handleSetActiveClick = () => {
    handleAction(() => onSetActive(session.id));
  };

  const handleStatusClick = () => {
    if (isLocked) {
      dialogs.warning(
        `Cannot change status of a ${session.status} session.`,
        "Status Locked"
      );
      setIsOpen(false);
      return;
    }
    handleAction(() => onChangeStatus(session));
  };

  return (
    <div className="session-actions-dropdown-container" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="p-1.5 rounded transition-colors relative cursor-pointer"
        style={{ color: "var(--text-secondary)" }}
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {isOpen && (
        <div
          className="fixed rounded-lg shadow-xl border w-56 z-50"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
            ...getDropdownPosition(),
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="py-1">
            <button
              onClick={() => handleAction(() => onView(session))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View Details</span>
            </button>

            {!isLocked && (
              <button
                onClick={() => handleAction(() => onEdit(session))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Edit className="w-4 h-4 text-yellow-500" />
                <span>Edit Session</span>
              </button>
            )}

            {canSetActive && (
              <button
                onClick={handleSetActiveClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Set as Active</span>
              </button>
            )}

            <button
              onClick={handleStatusClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <GitBranch className="w-4 h-4 text-blue-500" />
              <span>Change Status</span>
            </button>

            {!isLocked && (
              <>
                <div
                  className="border-t my-1"
                  style={{ borderColor: "var(--border-color)" }}
                ></div>
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                  style={{ color: "var(--danger-color)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--danger-color)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--danger-color)";
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Session</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionActionsDropdown;
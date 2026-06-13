// src/renderer/pages/farms/bukid/components/BukidActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { Eye, Edit, GitBranch, Trash2, MoreVertical } from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";
import type { BukidWithPitaks } from "../hooks/useBukids";

interface BukidActionsDropdownProps {
  bukid: BukidWithPitaks;
  onView: (bukid: BukidWithPitaks) => void;
  onEdit: (bukid: BukidWithPitaks) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (bukid: BukidWithPitaks) => void;
}

const BukidActionsDropdown: React.FC<BukidActionsDropdownProps> = ({
  bukid,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isLocked = bukid.status === "completed" || bukid.status === "cancelled";

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
    const dropdownHeight = 220;
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

  const handleDeleteClick = async () => {
    const confirmed = await dialogs.confirm({
      title: "Delete Farm",
      message: `Are you sure you want to delete "${bukid.name}"? This action cannot be undone.`,
    });
    if (!confirmed) return;
    handleAction(() => onDelete(bukid.id));
  };

  const handleStatusClick = () => {
    if (isLocked) {
      dialogs.warning(
        `Cannot change status of a ${bukid.status} farm.`,
        "Status Locked",
      );
      setIsOpen(false);
      return;
    }
    handleAction(() => onChangeStatus(bukid));
  };

  const dropdownStyle = {
    backgroundColor: "var(--card-bg)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
  };

  const buttonHoverStyle = {
    backgroundColor: "var(--card-hover-bg)",
  };

  return (
    <div className="bukid-actions-dropdown-container" ref={dropdownRef}>
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
            ...dropdownStyle,
            ...getDropdownPosition(),
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="py-1">
            {/* View Details */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(bukid));
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View Details</span>
            </button>

            {/* Edit (only if not locked) */}
            {!isLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onEdit(bukid));
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--card-hover-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Edit className="w-4 h-4 text-yellow-500" />
                <span>Edit Farm</span>
              </button>
            )}

            {/* Change Status */}
            <button
              onClick={handleStatusClick}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <GitBranch className="w-4 h-4 text-blue-500" />
              <span>Change Status</span>
            </button>

            {/* Divider */}
            <div
              className="border-t my-1"
              style={{ borderColor: "var(--border-color)" }}
            ></div>

            {/* Delete */}
            {!isLocked && (
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
                <span>Delete Farm</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BukidActionsDropdown;

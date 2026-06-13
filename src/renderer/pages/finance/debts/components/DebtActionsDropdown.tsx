// src/renderer/pages/finance/debts/components/DebtActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  GitBranch,
  MoreVertical,
  CreditCard,
} from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";
import type { DebtWithDetails } from "../types";

interface DebtActionsDropdownProps {
  debt: DebtWithDetails;
  onView: (debt: DebtWithDetails) => void;
  onEdit: (debt: DebtWithDetails) => void;
  onDelete?: (id: number) => void; // kept optional but not used
  onChangeStatus: (debt: DebtWithDetails) => void;
  onRecordPayment: (debt: DebtWithDetails) => void;
}

const DebtActionsDropdown: React.FC<DebtActionsDropdownProps> = ({
  debt,
  onView,
  onEdit,
  onChangeStatus,
  onRecordPayment,
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
    const dropdownHeight = 240; // reduced because no delete button
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

  const isLocked =
    debt.status === "paid" ||
    debt.status === "cancelled" ||
    debt.status === "settled";

  const handleStatusClick = () => {
    if (isLocked) {
      dialogs.warning(
        `Cannot change status of a ${debt.status} debt.`,
        "Status Locked",
      );
      setIsOpen(false);
      return;
    }
    handleAction(() => onChangeStatus(debt));
  };

  const handleRecordClick = () => handleAction(() => onRecordPayment(debt));

  return (
    <div className="debt-actions-dropdown-container" ref={dropdownRef}>
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
              onClick={() => handleAction(() => onView(debt))}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(debt);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--card-hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Edit className="w-4 h-4 text-yellow-500" />
                <span>Edit Debt</span>
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
            {!isLocked && debt.balance > 0 && (
              <button
                onClick={handleRecordClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--card-hover-bg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtActionsDropdown;
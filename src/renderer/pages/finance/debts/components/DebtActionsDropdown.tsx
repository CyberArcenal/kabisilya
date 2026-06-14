// src/renderer/pages/finance/debts/components/DebtActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { Eye, MoreVertical, CreditCard, XCircle } from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";
import type { DebtWithDetails } from "../types";

interface DebtActionsDropdownProps {
  debt: DebtWithDetails;
  onView: (debt: DebtWithDetails) => void;
  onRecordPayment: (debt: DebtWithDetails) => void;
  onCancel: (debt: DebtWithDetails) => void;
}

const DebtActionsDropdown: React.FC<DebtActionsDropdownProps> = ({
  debt,
  onView,
  onRecordPayment,
  onCancel,
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
    const dropdownHeight = 160; // increased for cancel button
    const windowHeight = window.innerHeight;
    if (rect.bottom + dropdownHeight > windowHeight) {
      return { bottom: `${windowHeight - rect.top + 5}px`, right: `${window.innerWidth - rect.right}px` };
    }
    return { top: `${rect.bottom + 5}px`, right: `${window.innerWidth - rect.right}px` };
  };

  const isLocked = debt.status === "paid" || debt.status === "cancelled" || debt.status === "settled";

  const handleCancelClick = () => {
    if (isLocked) {
      dialogs.warning(`Cannot cancel a ${debt.status} debt.`, "Action Not Allowed");
      setIsOpen(false);
      return;
    }
    handleAction(() => onCancel(debt));
  };

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
            {/* View Details */}
            <button
              onClick={() => handleAction(() => onView(debt))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <Eye className="w-4 h-4 text-sky-500" />
              <span>View Details</span>
            </button>

            {/* Record Payment (only if not locked and balance > 0) */}
            {!isLocked && debt.balance > 0 && (
              <button
                onClick={() => handleAction(() => onRecordPayment(debt))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <CreditCard className="w-4 h-4 text-emerald-500" />
                <span>Record Payment</span>
              </button>
            )}

            {/* Cancel Debt (only if not locked) */}
            {!isLocked && (
              <button
                onClick={handleCancelClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--card-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Cancel Debt</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtActionsDropdown;
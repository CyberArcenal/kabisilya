// src/renderer/pages/finance/worker-payments/components/PaymentActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import { Eye, Edit, GitBranch, Trash2, MoreVertical } from "lucide-react";
import { dialogs } from "../../../../utils/dialogs";
import type { PaymentWithDetails } from "../types";

interface PaymentActionsDropdownProps {
  payment: PaymentWithDetails;
  onView: (payment: PaymentWithDetails) => void;
  onEdit: (payment: PaymentWithDetails) => void;
  onDelete: (id: number) => void;
  onChangeStatus: (payment: PaymentWithDetails) => void;
}

const PaymentActionsDropdown: React.FC<PaymentActionsDropdownProps> = ({
  payment,
  onView,
  onEdit,
  onDelete,
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

  const isLocked = payment.status === "completed" || payment.status === "cancelled";

  const handleDeleteClick = async () => {
    const confirmed = await dialogs.confirm({
      title: "Delete Payment",
      message: `Are you sure you want to delete this payment?`,
    });
    if (!confirmed) return;
    handleAction(() => onDelete(payment.id));
  };

  const handleStatusClick = () => {
    if (isLocked) {
      dialogs.warning(
        `Cannot change status of a ${payment.status} payment.`,
        "Status Locked"
      );
      setIsOpen(false);
      return;
    }
    handleAction(() => onChangeStatus(payment));
  };

  return (
    <div className="payment-actions-dropdown-container" ref={dropdownRef}>
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
              onClick={(e) => {
                e.stopPropagation();
                handleAction(() => onView(payment));
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

            {!isLocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction(() => onEdit(payment));
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
                <Edit className="w-4 h-4 text-yellow-500" />
                <span>Edit Payment</span>
              </button>
            )}

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
                  <span>Delete Payment</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentActionsDropdown;
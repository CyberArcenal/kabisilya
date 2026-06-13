// src/renderer/pages/farms/assignments/components/ChangeAssignmentStatusModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';

interface ChangeAssignmentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentInfo: string; // e.g., "John on Plot A"
  currentStatus: string;
  onConfirm: (newStatus: string) => Promise<void>;
}

const getAvailableStatuses = (currentStatus: string): { value: string; label: string; color: string }[] => {
  switch (currentStatus) {
    case 'initiated':
      return [
        { value: 'active', label: 'Activate', color: 'var(--success-color)' },
        { value: 'cancelled', label: 'Cancel', color: 'var(--danger-color)' },
      ];
    case 'active':
      return [
        { value: 'completed', label: 'Complete', color: 'var(--success-color)' },
        { value: 'cancelled', label: 'Cancel', color: 'var(--danger-color)' },
      ];
    case 'completed':
    case 'cancelled':
      return [];
    default:
      return [];
  }
};

const ChangeAssignmentStatusModal: React.FC<ChangeAssignmentStatusModalProps> = ({
  isOpen,
  onClose,
  assignmentInfo,
  currentStatus,
  onConfirm,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const availableStatuses = getAvailableStatuses(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      onClose();
      return;
    }
    setLoading(newStatus);
    try {
      await onConfirm(newStatus);
      onClose();
    } catch (error) {
      console.error('Failed to change status', error);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (isOpen && availableStatuses.length === 0) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, availableStatuses.length, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Assignment Status" size="sm">
      {availableStatuses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This assignment cannot change status because it is already <strong>{currentStatus}</strong>.
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Change status for <strong>{assignmentInfo}</strong> from{' '}
            <span className="capitalize font-medium">{currentStatus}</span>:
          </p>
          <div className="flex flex-col gap-3">
            {availableStatuses.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={loading !== null}
                className="w-full py-2.5 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: status.color,
                  color: '#ffffff',
                  boxShadow: 'var(--shadow)',
                }}
              >
                {loading === status.value ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  status.label
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ChangeAssignmentStatusModal;
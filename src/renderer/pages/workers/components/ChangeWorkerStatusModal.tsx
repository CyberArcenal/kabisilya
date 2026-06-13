// src/renderer/pages/workers/components/ChangeWorkerStatusModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/UI/Modal';
import Button from '../../../components/UI/Button';

interface ChangeWorkerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  currentStatus: string;
  onConfirm: (newStatus: string) => Promise<void>;
}

const statusOptions: { value: string; label: string; color: string }[] = [
  { value: 'active', label: 'Active', color: 'var(--success-color)' },
  { value: 'inactive', label: 'Inactive', color: 'var(--warning-color)' },
  { value: 'on-leave', label: 'On Leave', color: 'var(--warning-color)' },
  { value: 'terminated', label: 'Terminated', color: 'var(--danger-color)' },
];

const getAvailableStatuses = (currentStatus: string) => {
  // Allow any transition except staying same, but terminated is locked
  if (currentStatus === 'terminated') return [];
  return statusOptions.filter(s => s.value !== currentStatus);
};

const ChangeWorkerStatusModal: React.FC<ChangeWorkerStatusModalProps> = ({
  isOpen,
  onClose,
  workerName,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Change Worker Status" size="sm">
      {availableStatuses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-secondary)]">
            This worker cannot change status because they are already <strong>terminated</strong>.
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Change status for <strong>{workerName}</strong> from{' '}
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

export default ChangeWorkerStatusModal;
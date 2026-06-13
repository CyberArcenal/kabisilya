// src/renderer/pages/farms/bukid/components/BukidFormModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';
import bukidAPI from '../../../../api/core/bukid';
import { showWarning } from '../../../../utils/notification';
import { useDefaultSessionId } from '../../../../utils/config/farmConfig';

interface BukidFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    id: number;
    name: string;
    sessionId: number;
    status: string;
    location?: string;
    description?: string;
  } | null;
}

const BukidFormModal: React.FC<BukidFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const defaultSessionId = useDefaultSessionId();
  const [form, setForm] = useState({
    name: '',
    sessionId: defaultSessionId || 0,
    status: 'active',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        sessionId: initialData.sessionId,
        status: initialData.status === 'initiated' ? 'active' : initialData.status,
        location: initialData.location || '',
        description: initialData.description || '',
      });
    } else if (defaultSessionId) {
      setForm(prev => ({ ...prev, sessionId: defaultSessionId, status: 'active' }));
    } else {
      setForm(prev => ({ ...prev, sessionId: 0, status: 'active' }));
    }
  }, [initialData, isOpen, defaultSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showWarning('Please enter a farm name.');
      return;
    }
    if (!form.sessionId) {
      showWarning('No default session configured. Please set a default session in system settings.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        sessionId: form.sessionId,
        status: initialData?.id ? form.status as "active" | "initiated" | "completed" | "cancelled" | undefined : 'active',
        location: form.location.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (initialData?.id) {
        await bukidAPI.update(initialData.id, payload);
      } else {
        await bukidAPI.create(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save farm', error);
      showWarning('Failed to save farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Farm' : 'Add Farm'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" loading={loading} disabled={!defaultSessionId}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </div>
        {!defaultSessionId && (
          <p className="text-xs text-red-500 mt-1">No default session configured. Please set a default session in system settings.</p>
        )}
      </form>
    </Modal>
  );
};

export default BukidFormModal;
// src/renderer/pages/farms/bukid/components/BukidFormModal.tsx
import React, { useEffect, useState } from 'react';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';
import SessionSelect from '../../../../components/Selects/SessionSelect';
import bukidAPI from '../../../../api/core/bukid';

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
    area?: number;
    description?: string;
  } | null;
}

const statusOptions = [
  { value: 'initiated', label: 'Initiated' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BukidFormModal: React.FC<BukidFormModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState({
    name: '',
    sessionId: 0,
    status: 'active',
    location: '',
    area: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        sessionId: initialData.sessionId,
        status: initialData.status,
        location: initialData.location || '',
        area: initialData.area !== undefined ? String(initialData.area) : '',
        description: initialData.description || '',
      });
    } else {
      setForm({
        name: '',
        sessionId: 0,
        status: 'active',
        location: '',
        area: '',
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.sessionId) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        sessionId: form.sessionId,
        status: form.status as "initiated" | "active" | "completed" | "cancelled" | undefined,
        location: form.location.trim() || undefined,
        area: form.area ? parseFloat(form.area) : undefined,
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Session *</label>
          <SessionSelect
            value={form.sessionId}
            onChange={(id) => setForm({ ...form, sessionId: id || 0 })}
            onlyActive={false}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-primary)' }}
          >
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
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
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Area (ha)</label>
          <input
            type="number"
            step="0.01"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
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
          <Button variant="primary" type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BukidFormModal;
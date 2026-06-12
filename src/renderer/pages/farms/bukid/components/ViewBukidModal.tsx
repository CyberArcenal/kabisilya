// src/renderer/pages/farms/bukid/components/BukidViewModal.tsx
import React from 'react';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';
import { MapPin } from 'lucide-react';
import type { BukidWithPitaks } from '../hooks/useBukids';

interface BukidViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bukid: BukidWithPitaks | null;
  onPitakClick?: (pitakId: number) => void;
}

const BukidViewModal: React.FC<BukidViewModalProps> = ({ isOpen, onClose, bukid, onPitakClick }) => {
  if (!bukid) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Farm Details" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Name</label>
            <p className="text-[var(--text-primary)] font-medium">{bukid.name}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Status</label>
            <p className="capitalize">{bukid.status}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Session</label>
            <p>{bukid.session?.name} ({bukid.session?.year})</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Location</label>
            <p>{bukid.location || '—'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Area (ha)</label>
            <p>{bukid.area ?? '—'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)]">Description</label>
            <p className="whitespace-pre-wrap">{bukid.description || '—'}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-tertiary)] mb-2 block">Plots under this farm</label>
          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--card-secondary-bg)]">
                <tr>
                  <th className="text-left px-3 py-2 text-[var(--text-secondary)]">Location</th>
                  <th className="text-left px-3 py-2 text-[var(--text-secondary)]">Area</th>
                  <th className="text-left px-3 py-2 text-[var(--text-secondary)]">Status</th>
                  <th className="text-left px-3 py-2 text-[var(--text-secondary)]"></th>
                </tr>
              </thead>
              <tbody>
                {(!bukid.pitaks || bukid.pitaks.length === 0) ? (
                  <tr><td colSpan={4} className="px-3 py-4 text-center text-[var(--text-tertiary)]">No plots yet</td></tr>
                ) : (
                  bukid.pitaks.map((pitak) => (
                    <tr key={pitak.id} className="border-t border-[var(--border-color)]">
                      <td className="px-3 py-2">{pitak.location}</td>
                      <td className="px-3 py-2">{pitak.area ?? '—'}</td>
                      <td className="px-3 py-2 capitalize">{pitak.status}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => onPitakClick?.(pitak.id)} className="text-xs text-[var(--primary-color)] hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default BukidViewModal;
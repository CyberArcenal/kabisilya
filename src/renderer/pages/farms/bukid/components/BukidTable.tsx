// src/renderer/pages/farms/bukid/components/BukidTable.tsx
import React from 'react';
import { Eye, Edit, Trash2, MapPin } from 'lucide-react';
import type { BukidWithPitaks } from '../hooks/useBukids';

interface BukidTableProps {
  bukids: BukidWithPitaks[];
  onView: (bukid: BukidWithPitaks) => void;
  onEdit: (bukid: BukidWithPitaks) => void;
  onDelete: (id: number) => void;
  onPitakClick?: (pitakId: number) => void;
}

const getStatusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs rounded-full font-medium';
  switch (status) {
    case 'active': return `${base} bg-green-100 text-green-800`;
    case 'initiated': return `${base} bg-yellow-100 text-yellow-800`;
    case 'completed': return `${base} bg-blue-100 text-blue-800`;
    case 'cancelled': return `${base} bg-red-100 text-red-800`;
    default: return `${base} bg-gray-100 text-gray-800`;
  }
};

const PlotStack: React.FC<{ pitaks: any[]; onPitakClick?: (id: number) => void }> = ({ pitaks, onPitakClick }) => {
  const maxDisplay = 3;
  const displayed = pitaks.slice(0, maxDisplay);
  const remaining = pitaks.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-2">
      {displayed.map((pitak) => (
        <button
          key={pitak.id}
          onClick={() => onPitakClick?.(pitak.id)}
          className="w-8 h-8 rounded-full bg-[var(--card-secondary-bg)] border-2 border-white dark:border-gray-800 flex items-center justify-center hover:scale-110 transition-transform"
          title={pitak.location || `Plot #${pitak.id}`}
        >
          <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
        </button>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800">
          +{remaining}
        </div>
      )}
    </div>
  );
};

const BukidTable: React.FC<BukidTableProps> = ({ bukids, onView, onEdit, onDelete, onPitakClick }) => {
  if (bukids.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)] border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        No farms found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Location</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Area (ha)</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Session</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Plots</th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bukids.map((bukid) => (
            <tr key={bukid.id} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
              <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">{bukid.name}</td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{bukid.location || '—'}</td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{bukid.area ?? '—'}</td>
              <td className="py-2.5 px-4"><span className={getStatusBadge(bukid.status)}>{bukid.status}</span></td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)]">{bukid.session?.name || '—'}</td>
              <td className="py-2.5 px-4">
                <PlotStack pitaks={bukid.pitaks || []} onPitakClick={onPitakClick} />
              </td>
              <td className="py-2.5 px-4">
                <div className="flex gap-2">
                  <button onClick={() => onView(bukid)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(bukid)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(bukid.id)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BukidTable;
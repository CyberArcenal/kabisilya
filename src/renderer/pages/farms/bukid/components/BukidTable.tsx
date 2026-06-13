// src/renderer/pages/farms/bukid/components/BukidTable.tsx
import React from 'react';
import { MapPin } from 'lucide-react';
import type { BukidWithPitaks } from '../hooks/useBukids';
import BukidActionsDropdown from './BukidActionsDropdown';

interface BukidTableProps {
  bukids: BukidWithPitaks[];
  onView: (bukid: BukidWithPitaks) => void;
  onEdit: (bukid: BukidWithPitaks) => void;
  onDelete: (id: number) => void;
  onPitakClick?: (pitakId: number) => void;        // opens modal for a single plot
  onChangeStatus: (bukid: BukidWithPitaks) => void;
  onViewPlots?: (bukidId: number) => void;         // navigates to Pitak page with filter
}

const getStatusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs rounded-full font-medium';
  switch (status) {
    case 'active': return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`;
    case 'initiated': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`;
    case 'completed': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`;
    case 'cancelled': return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`;
    default: return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
  }
};

const PlotStack: React.FC<{ 
  pitaks: any[]; 
  bukidId: number;
  onPitakClick?: (pitakId: number) => void;
  onViewPlots?: (bukidId: number) => void;
}> = ({ pitaks, bukidId, onPitakClick, onViewPlots }) => {
  const maxDisplay = 3;
  const displayed = pitaks.slice(0, maxDisplay);
  const remaining = pitaks.length - maxDisplay;

  const handleViewAll = () => {
    if (onViewPlots) onViewPlots(bukidId);
  };

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
        <button
          onClick={handleViewAll}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          title={`View all ${pitaks.length} plots`}
        >
          +{remaining}
        </button>
      )}
    </div>
  );
};

const BukidTable: React.FC<BukidTableProps> = ({
  bukids,
  onView,
  onEdit,
  onDelete,
  onPitakClick,
  onChangeStatus,
  onViewPlots,
}) => {
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
                <PlotStack 
                  pitaks={bukid.pitaks || []} 
                  bukidId={bukid.id}
                  onPitakClick={onPitakClick}
                  onViewPlots={onViewPlots}
                />
              </td>
              <td className="py-2.5 px-4">
                <BukidActionsDropdown
                  bukid={bukid}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onChangeStatus={onChangeStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BukidTable;
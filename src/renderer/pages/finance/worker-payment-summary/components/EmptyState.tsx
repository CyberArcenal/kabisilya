// components/EmptyState.tsx
import React from "react";
import { type LucideIcon, FilterX } from "lucide-react";
import Button from "../../../../components/UI/Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-[var(--card-secondary-bg)] mb-4">
        <Icon className="w-12 h-12 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md">{description}</p>
      {onReset && (
        <Button variant="primary" className="mt-4" onClick={onReset} icon={FilterX}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};
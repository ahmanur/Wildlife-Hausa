import React from 'react';

type Status = 'active' | 'pending' | 'completed' | 'inactive';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  const styles = {
    active: 'bg-wild-moss/20 text-wild-moss border-wild-moss',
    pending: 'bg-wild-sun-soft/20 text-wild-sunset border-wild-sun-soft',
    completed: 'bg-wild-forest/20 text-wild-forest border-wild-forest',
    inactive: 'bg-wild-muted/20 text-wild-muted border-wild-muted',
  };

  const defaultLabels = {
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    inactive: 'Inactive',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]} ${className}`}>
      {label || defaultLabels[status]}
    </span>
  );
}

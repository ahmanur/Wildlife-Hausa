import React from 'react';

interface SafariRingBadgeProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SafariRingBadge({ children, className = '', size = 'sm' }: SafariRingBadgeProps) {
  return (
    <div className={`inline-flex items-center justify-center border-2 border-wild-sunset rounded-full px-4 py-1 text-wild-sunset font-sans font-medium text-xs tracking-wider uppercase bg-wild-sand/80 backdrop-blur-sm shadow-sm ${className}`}>
      {children}
    </div>
  );
}

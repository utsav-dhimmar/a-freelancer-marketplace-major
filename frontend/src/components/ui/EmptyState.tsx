import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = '🔍',
  title,
  description,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`card border-0 shadow-sm text-center py-5 ${className}`}>
      <div className="card-body">
        <div className="display-4 text-muted mb-3">{icon}</div>
        <h3 className="h5">{title}</h3>
        {description && <p className="text-muted mb-0">{description}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}

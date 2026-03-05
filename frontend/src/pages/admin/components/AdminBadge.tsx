import React from 'react';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

const variantMap: Record<string, string> = {
  open: 'bg-success-subtle text-success border border-success-subtle',
  in_progress: 'bg-primary-subtle text-primary border border-primary-subtle',
  completed: 'bg-success-subtle text-success border border-success-subtle',
  cancelled: 'bg-danger-subtle text-danger border border-danger-subtle',
  active: 'bg-primary-subtle text-primary border border-primary-subtle',
  submitted: 'bg-warning-subtle text-warning border border-warning-subtle',
  disputed: 'bg-danger-subtle text-danger border border-danger-subtle',
  pending: 'bg-warning-subtle text-warning border border-warning-subtle',
  accepted: 'bg-success-subtle text-success border border-success-subtle',
  rejected: 'bg-danger-subtle text-danger border border-danger-subtle',
  client: 'bg-primary-subtle text-primary border border-primary-subtle',
  freelancer: 'bg-success-subtle text-success border border-success-subtle',
  admin: 'bg-info-subtle text-info border border-info-subtle',
};

export function AdminBadge({
  children,
  variant,
  className = '',
}: AdminBadgeProps) {
  const bootstrapVariant = variant
    ? variantMap[variant] || 'bg-secondary-subtle text-secondary'
    : 'bg-secondary-subtle text-secondary';

  return (
    <span
      className={`badge rounded-pill fw-semibold text-uppercase px-2 py-1 ${bootstrapVariant} ${className}`}
      style={{ fontSize: '0.7rem', letterSpacing: '0.3px' }}
    >
      {children}
    </span>
  );
}

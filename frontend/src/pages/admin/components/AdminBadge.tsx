import React from 'react';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function AdminBadge({
  children,
  variant,
  className = '',
}: AdminBadgeProps) {
  const badgeClass = variant ? `admin-badge ${variant}` : 'admin-badge';
  return <span className={`${badgeClass} ${className}`}>{children}</span>;
}

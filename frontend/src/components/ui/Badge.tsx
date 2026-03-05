import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  pill?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'secondary',
  pill = false,
  className = '',
}: BadgeProps) {
  const baseClass = pill ? 'badge rounded-pill' : 'badge';
  const variantClass = `bg-${variant}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

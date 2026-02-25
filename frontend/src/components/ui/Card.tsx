import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`card shadow-sm border-0 ${className}`}>
      {title && (
        <div className="card-header border-0 bg-transparent">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

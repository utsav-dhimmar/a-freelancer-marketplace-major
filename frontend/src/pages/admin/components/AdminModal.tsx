import React from 'react';

interface AdminModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  maxWidth?: string;
  className?: string;
}

export function AdminModal({
  title,
  isOpen,
  onClose,
  children,
  footer,
  loading = false,
  maxWidth,
  className = '',
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className={`admin-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <div className="admin-loading" style={{ padding: '2rem 0' }}>
              <div className="admin-spinner" />
              <span>Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

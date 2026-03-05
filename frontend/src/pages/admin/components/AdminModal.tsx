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
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${className}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body px-4 py-4">
            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mb-0 fw-medium">Loading...</p>
              </div>
            ) : (
              children
            )}
          </div>
          {footer && (
            <div className="modal-footer border-top px-4 py-3 bg-light">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

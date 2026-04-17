import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'alert' | 'confirm' | 'default';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  variant = 'default',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isLoading = false,
}: ModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1055 }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body py-4">{children}</div>
          <div className="modal-footer border-top-0 pt-0">
            {footer ? (
              footer
            ) : (
              <div className="d-flex gap-2 justify-content-end w-100">
                {variant === 'confirm' && (
                  <Button variant="outline-secondary" onClick={onClose} disabled={isLoading}>
                    {cancelText}
                  </Button>
                )}
                <Button
                  variant={variant === 'confirm' ? 'primary' : 'primary'}
                  onClick={onConfirm || onClose}
                  isLoading={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

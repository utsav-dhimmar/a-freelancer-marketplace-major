export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface AdminToastProps {
  toasts: Toast[];
}

export function AdminToast({ toasts }: AdminToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast show align-items-center border-0 shadow-lg mb-2 text-white ${t.type === 'success' ? 'bg-success' : 'bg-danger'}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex p-1">
            <div className="toast-body fw-medium py-2 px-3">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

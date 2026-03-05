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
    <div className="admin-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

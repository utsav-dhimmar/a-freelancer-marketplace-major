interface AdminLoadingProps {
  message?: string;
}

export function AdminLoading({ message = 'Loading...' }: AdminLoadingProps) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted">
      <div
        className="spinner-border text-primary mb-3"
        role="status"
        style={{ width: '2.5rem', height: '2.5rem' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="fw-medium">{message}</span>
    </div>
  );
}

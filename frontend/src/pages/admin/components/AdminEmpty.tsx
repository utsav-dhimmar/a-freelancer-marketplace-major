interface AdminEmptyProps {
  icon?: string;
  message?: string;
}

export function AdminEmpty({ message = 'No records found' }: AdminEmptyProps) {
  return (
    <div className="text-center py-5 text-muted border rounded-3 bg-white mt-4 shadow-sm">
      <div className="mb-2" style={{ fontSize: '2rem', opacity: 0.5 }}>
        📂
      </div>
      <p className="mb-0 fw-medium">{message}</p>
    </div>
  );
}

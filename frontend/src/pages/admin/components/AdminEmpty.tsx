interface AdminEmptyProps {
  icon?: string;
  message?: string;
}

export function AdminEmpty({ message = 'No records found' }: AdminEmptyProps) {
  return (
    <div className="admin-empty">
      <p>{message}</p>
    </div>
  );
}

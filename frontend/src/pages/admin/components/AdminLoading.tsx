interface AdminLoadingProps {
  message?: string;
}

export function AdminLoading({ message = 'Loading...' }: AdminLoadingProps) {
  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <span>{message}</span>
    </div>
  );
}

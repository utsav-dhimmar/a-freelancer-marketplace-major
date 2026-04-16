interface SpinnerProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({
  variant = 'primary',
  size = 'md',
  className = '',
}: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';
  const variantClass = `text-${variant}`;

  return (
    <div
      className={`spinner-border ${variantClass} ${sizeClass} ${className}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}

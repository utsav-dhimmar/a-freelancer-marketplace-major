import { HiOutlineCalendarDays } from 'react-icons/hi2';

interface DateDisplayProps {
  date: string | Date;
  label?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'muted' | 'primary' | 'info';
}

export function DateDisplay({
  date,
  label,
  showIcon = true,
  className = '',
  variant = 'muted',
}: DateDisplayProps) {
  const dateObj = new Date(date);
  const isValidDate = !isNaN(dateObj.getTime());

  if (!isValidDate) {
    return <span className={`text-danger ${className}`}>Invalid Date</span>;
  }

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const variantClasses = {
    muted: 'text-muted',
    primary: 'text-primary fw-semibold',
    info: 'text-info',
  };

  return (
    <div className={`d-inline-flex align-items-center gap-1 ${className}`}>
      {showIcon && (
        <HiOutlineCalendarDays
          className={variant === 'primary' ? 'text-primary' : 'text-muted'}
          style={{ marginTop: '-1px' }}
        />
      )}
      {label && <span className="small text-muted me-1">{label}</span>}
      <span className={`small ${variantClasses[variant]}`}>
        {formattedDate}
      </span>
    </div>
  );
}

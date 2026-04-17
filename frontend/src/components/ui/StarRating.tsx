interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  value,
  max = 5,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const sizes = {
    sm: '1.25rem',
    md: '1.75rem',
    lg: '2.5rem',
  };

  const currentSize = sizes[size];

  return (
    <div
      className={`d-inline-flex gap-1 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
      style={{ fontSize: currentSize }}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          className="transition-colors"
          style={{
            color: star <= value ? '#f59e0b' : '#d1d5db',
            cursor: readonly ? 'default' : 'pointer',
          }}
          role={readonly ? 'img' : 'button'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

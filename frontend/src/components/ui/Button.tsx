import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant:
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-danger'
  | 'ghost'
  | 'danger'
  | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  children,
  disabled,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const variantMap: Record<ButtonProps['variant'], string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-secondary',
    'outline-primary': 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary',
    'outline-danger': 'btn-outline-danger',
    ghost: 'btn-link text-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  const sizeClass = size === 'md' ? '' : `btn-${size}`;
  const variantClass = variantMap[variant] ?? variantMap.primary;

  return (
    <button
      ref={ref}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
      ) : (
        children
      )}
    </button>
  );
};

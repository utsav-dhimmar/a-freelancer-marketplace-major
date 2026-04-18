import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-danger'
    | 'ghost'
    | 'danger'
    | 'success'
    | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variantMap: Record<string, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline-secondary',
      'outline-primary': 'btn-outline-primary',
      'outline-secondary': 'btn-outline-secondary',
      'outline-danger': 'btn-outline-danger',
      ghost: 'btn-link text-secondary',
      danger: 'btn-danger',
      success: 'btn-success',
      warning: 'btn-warning',
    };
    const sizeClass = size === 'md' ? '' : `btn-${size}`;
    const variantClass = variantMap[variant || 'primary'] ?? variantMap.primary;

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
  },
);

Button.displayName = 'Button';

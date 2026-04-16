import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  },
);

Input.displayName = 'Input';

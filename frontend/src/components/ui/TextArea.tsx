import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = ({
  label,
  error,
  className = '',
  id,
  ref,
  ...props
}: TextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) => {
  const textareaId = id || props.name;
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

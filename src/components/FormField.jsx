import { forwardRef } from 'react';

const FormField = forwardRef(function FormField(
  {
    label,
    error,
    id,
    as: Element = 'input',
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Element
        {...props}
        ref={ref}
        className={`input ${className}${error ? ' input--error' : ''}`.trim()}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span className="form-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default FormField;

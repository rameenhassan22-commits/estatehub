import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({ label, error, hint, id, className = "", ...inputProps }) {
  const fieldId = id || inputProps.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`input ${error ? "input-error" : ""}`}
        {...inputProps}
      />
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label = "Password", error, hint, id, className = "", ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const fieldId = id || inputProps.name;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`input pr-11 ${error ? "input-error" : ""}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({ label, error, id, className = "", children, ...props }) {
  const fieldId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select id={fieldId} className={`input ${error ? "input-error" : ""}`} {...props}>
        {children}
      </select>
      <FieldMessage id={fieldId} error={error} />
    </div>
  );
}

export function TextAreaField({ label, error, hint, id, className = "", ...props }) {
  const fieldId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        aria-invalid={error ? "true" : "false"}
        className={`input min-h-28 resize-y ${error ? "input-error" : ""}`}
        {...props}
      />
      <FieldMessage id={fieldId} error={error} hint={hint} />
    </div>
  );
}

function FieldMessage({ id, error, hint }) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
        {error.message || error}
      </p>
    );
  }
  return hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null;
}
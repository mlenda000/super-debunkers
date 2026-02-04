import type { InputProps } from "@/types/types";

const Input = ({
  value,
  onChange,
  placeholder,
  style,
  id,
  name,
  label,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  required = false,
  autoComplete,
}: InputProps) => {
  const inputId =
    id ||
    name ||
    `input-${placeholder?.replace(/\s+/g, "-").toLowerCase() || "field"}`;
  const effectiveAriaLabel = ariaLabel || label || placeholder;

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name || inputId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={style}
        className="input"
        aria-label={!label ? effectiveAriaLabel : undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};
export default Input;

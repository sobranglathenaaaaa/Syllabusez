"use client";

/**
 * FieldLabel — 11px / 500 / uppercase label above form fields.
 */
export function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--color-text-secondary)",
        marginBottom: 4,
      }}
    >
      {children}
    </label>
  );
}

/**
 * InputField — Editable 13px input with maroon focus ring.
 */
export function InputField({ id, type = "text", value, onChange, placeholder, disabled, style }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 400,
        borderRadius: "var(--radius-inner)",
        border: "1px solid var(--color-border-secondary)",
        background: "var(--color-background-primary)",
        color: "var(--color-text-primary)",
        outline: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "text",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = "#800000";
        e.target.style.boxShadow = "0 0 0 3px rgba(128,0,0,0.1)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "var(--color-border-secondary)";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

/**
 * ReadOnlyField — Non-editable field with lock icon + "Non-editable" badge.
 */
export function ReadOnlyField({ id, value, label }) {
  return (
    <div
      id={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 400,
        borderRadius: "var(--radius-inner)",
        border: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-secondary)",
        color: "var(--color-text-primary)",
        boxSizing: "border-box",
      }}
    >
      <i className="ti ti-lock" aria-hidden="true" style={{ fontSize: 15, color: "var(--color-text-secondary)", flexShrink: 0 }} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value || <span style={{ color: "var(--color-text-secondary)" }}>{label || "—"}</span>}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          background: "var(--color-background-tertiary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 6,
          padding: "1px 6px",
          flexShrink: 0,
        }}
      >
        Non-editable
      </span>
    </div>
  );
}

/**
 * Toggle — 40×22px pill switch with role="switch" and aria-checked.
 */
export function Toggle({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 40,
        height: 22,
        borderRadius: 11,
        border: `1px solid ${checked ? "#800000" : "var(--color-border-secondary)"}`,
        background: checked ? "#800000" : "var(--color-background-secondary)",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

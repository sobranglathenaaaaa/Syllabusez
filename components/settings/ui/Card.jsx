"use client";

/**
 * Card — White surface card following the design system.
 * Props:
 *   children   — card body content
 *   className  — optional extra classes
 */
export default function Card({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--radius-card)",
        padding: "20px 22px",
      }}
    >
      {children}
    </div>
  );
}

/**
 * SectionLabel — 11px / 500 / uppercase label with bottom border.
 */
export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "var(--color-text-secondary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        paddingBottom: 8,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

"use client";

/**
 * SaveBar — right-aligned action bar with inline toast.
 *
 * Props:
 *   onSave       — async save handler (must throw on error)
 *   saveLabel    — button label, default "Save changes"
 *   children     — optional extra buttons/content left of save
 */

import { useState } from "react";

export default function SaveBar({ onSave, saveLabel = "Save changes", children }) {
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      await onSave();
      setToast({ type: "success", message: "Changes saved successfully." });
      setTimeout(() => setToast(null), 2800);
    } catch (err) {
      setToast({ type: "error", message: err?.message || "Failed to save changes." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        paddingTop: 16,
        borderTop: "0.5px solid var(--color-border-tertiary)",
        flexWrap: "wrap",
      }}
    >
      {/* Inline toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 400,
            background: toast.type === "success"
              ? "var(--color-background-success)"
              : "var(--color-background-danger)",
            border: `1px solid ${toast.type === "success"
              ? "var(--color-border-success)"
              : "var(--color-border-danger)"}`,
            color: toast.type === "success"
              ? "var(--color-text-success)"
              : "var(--color-text-danger)",
          }}
        >
          <i
            className={`ti ${toast.type === "success" ? "ti-circle-check" : "ti-circle-x"}`}
            aria-hidden="true"
            style={{ fontSize: 14 }}
          />
          {toast.message}
        </div>
      )}

      {children}

      {/* Primary save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 20px",
          background: saving ? "#a05050" : "#800000",
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          borderRadius: "var(--radius-inner)",
          border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          transition: "background 0.15s, transform 0.1s",
        }}
        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#600000"; }}
        onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#800000"; }}
        onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <i className="ti ti-device-floppy" aria-hidden="true" style={{ fontSize: 15 }} />
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Card, { SectionLabel } from "./ui/Card";
import { FieldLabel, InputField } from "./ui/FormFields";
import SaveBar from "./ui/SaveBar";

const INFO_ROWS = [
  { key: "helpCenter",     label: "Help center",         icon: "ti-help-circle",      tablerField: "helpCenter"    },
  { key: "privacyPolicy",  label: "Privacy policy",      icon: "ti-lock",             tablerField: "privacyPolicy" },
  { key: "terms",          label: "Terms and conditions", icon: "ti-file-text",       tablerField: "terms"         },
  { key: "version",        label: "System version",      icon: "ti-versions",         tablerField: "version"       },
];

export default function About({ role: roleProp }) {
  const role = roleProp || "student";
  const [content, setContent] = useState({
    helpCenter:    "For support, visit the PUP ICT portal or contact your department administrator.",
    privacyPolicy: "Your personal data is handled in accordance with Republic Act 10173 (Data Privacy Act of 2012).",
    terms:         "Use of this system is governed by the PUP Student Handbook and applicable university policies.",
    version:       "1.0.0",
  });

  const isAdmin = role === "admin";

  const handleChange = e => {
    const { name, value } = e.target;
    setContent(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    // TODO: replace with real API call when backend is ready
    // await fetch("/api/admin/about", { method: "PUT", ... })
    // For now, no-op (simulates success)
  };

  return (
    <Card>
      {/* Accordion rows */}
      {INFO_ROWS.map(row => (
        <AboutRow
          key={row.key}
          label={row.label}
          icon={row.icon}
          value={content[row.key]}
          name={row.key}
          isAdmin={isAdmin}
          onChange={handleChange}
        />
      ))}

      {/* Admin save bar */}
      {isAdmin && (
        <SaveBar onSave={handleSave} saveLabel="Save about content" />
      )}
    </Card>
  );
}

/* ── Single info accordion row ── */
function AboutRow({ label, icon, value, name, isAdmin, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        marginBottom: 0,
      }}
    >
      {/* Trigger */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 0",
          background: open ? "var(--color-brand-tint, #fdf2f2)" : "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
          borderRadius: open ? 8 : 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#fdf2f2"; }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? "#fdf2f2" : "transparent"; }}
      >
        {/* Icon block */}
        <div
          aria-hidden="true"
          style={{
            width: 36, height: 36, flexShrink: 0,
            borderRadius: 10,
            background: open ? "#800000" : "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          <i
            className={`ti ${icon}`}
            style={{ fontSize: 16, color: open ? "#fff" : "var(--color-text-secondary)" }}
          />
        </div>

        {/* Label group */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
            {label}
          </div>
          {!open && (
            <div style={{
              fontSize: 11, color: "var(--color-text-secondary)",
              marginTop: 1, overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", maxWidth: "80%",
            }}>
              {value}
            </div>
          )}
        </div>

        {/* Chevron */}
        <i
          className="ti ti-chevron-down"
          aria-hidden="true"
          style={{
            fontSize: 16,
            color: open ? "#800000" : "var(--color-text-secondary)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), color 0.2s",
            flexShrink: 0,
            marginRight: 4,
          }}
        />
      </button>

      {/* Body */}
      <div
        style={{
          maxHeight: open ? 300 : 0,
          overflow: "hidden",
          transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            borderTop: "0.5px solid var(--color-border-tertiary)",
            padding: "10px 0 14px",
          }}
        >
          {isAdmin ? (
            <>
              <FieldLabel htmlFor={`about-${name}`}>{label}</FieldLabel>
              {name === "version" ? (
                <InputField
                  id={`about-${name}`}
                  name={name}
                  value={value}
                  onChange={onChange}
                />
              ) : (
                <textarea
                  id={`about-${name}`}
                  name={name}
                  value={value}
                  onChange={onChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    borderRadius: "var(--radius-inner)",
                    border: "1px solid var(--color-border-secondary)",
                    background: "var(--color-background-primary)",
                    color: "var(--color-text-primary)",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#800000";
                    e.target.style.boxShadow   = "0 0 0 3px rgba(128,0,0,0.1)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "var(--color-border-secondary)";
                    e.target.style.boxShadow   = "none";
                  }}
                />
              )}
            </>
          ) : (
            <p style={{
              fontSize: 13, color: "var(--color-text-primary)",
              lineHeight: 1.6, margin: 0,
              padding: "2px 0",
            }}>
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

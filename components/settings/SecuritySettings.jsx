"use client";

import { useState } from "react";
import Card, { SectionLabel } from "./ui/Card";
import { FieldLabel, InputField } from "./ui/FormFields";
import SaveBar from "./ui/SaveBar";

/* ── Strength levels ── */
const STRENGTH_LEVELS = [
  { label: "Weak",   color: "#c0392b" },
  { label: "Fair",   color: "#e67e22" },
  { label: "Good",   color: "#2980b9" },
  { label: "Strong", color: "#27ae60" },
];

function measureStrength(pw) {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

const REQUIREMENTS = [
  { test: pw => pw.length >= 8,           label: "At least 8 characters"       },
  { test: pw => /[A-Z]/.test(pw),         label: "One uppercase letter"        },
  { test: pw => /[0-9]/.test(pw),         label: "One number"                  },
  { test: pw => /[^A-Za-z0-9]/.test(pw), label: "One special character"       },
];

export default function SecuritySettings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const toggleShow = key => setShowPw(p => ({ ...p, [key]: !p[key] }));

  const strength = measureStrength(form.newPassword);
  const strengthInfo = form.newPassword ? STRENGTH_LEVELS[Math.max(0, strength - 1)] : null;

  const handleSave = async () => {
    if (!form.currentPassword) throw new Error("Current password is required.");
    if (!form.newPassword)     throw new Error("New password is required.");
    if (form.newPassword !== form.confirmPassword) throw new Error("Passwords do not match.");

    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "Failed to change password");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <Card>
      <SectionLabel>
        <i className="ti ti-shield-lock" aria-hidden="true" style={{ fontSize: 15, marginRight: 6 }} />
        Change password
      </SectionLabel>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>

        {/* Current password */}
        <div>
          <FieldLabel htmlFor="sec-current">Current password</FieldLabel>
          <div style={{ position: "relative" }}>
            <InputField
              id="sec-current"
              type={showPw.current ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              aria-label={showPw.current ? "Hide password" : "Show password"}
              onClick={() => toggleShow("current")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-secondary)", fontSize: 16, padding: 0,
              }}
            >
              <i className={`ti ${showPw.current ? "ti-eye-off" : "ti-eye"}`} />
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <FieldLabel htmlFor="sec-new">New password</FieldLabel>
          <div style={{ position: "relative" }}>
            <InputField
              id="sec-new"
              type={showPw.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Create new password"
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              aria-label={showPw.new ? "Hide password" : "Show password"}
              onClick={() => toggleShow("new")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-secondary)", fontSize: 16, padding: 0,
              }}
            >
              <i className={`ti ${showPw.new ? "ti-eye-off" : "ti-eye"}`} />
            </button>
          </div>

          {/* Strength meter */}
          {form.newPassword && (
            <div style={{ marginTop: 8 }}>
              {/* Bar */}
              <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                {STRENGTH_LEVELS.map((level, idx) => (
                  <div
                    key={level.label}
                    style={{
                      flex: 1, height: 3, borderRadius: 4,
                      background: idx < strength ? level.color : "var(--color-border-tertiary)",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              {strengthInfo && (
                <span style={{ fontSize: 11, fontWeight: 500, color: strengthInfo.color }}>
                  {strengthInfo.label}
                </span>
              )}

              {/* Checklist */}
              <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                {REQUIREMENTS.map(req => {
                  const pass = req.test(form.newPassword);
                  return (
                    <li
                      key={req.label}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontSize: 11, color: pass ? "#27ae60" : "var(--color-text-secondary)",
                      }}
                    >
                      <i
                        className={`ti ${pass ? "ti-circle-check" : "ti-circle"}`}
                        aria-hidden="true"
                        style={{ fontSize: 13 }}
                      />
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <FieldLabel htmlFor="sec-confirm">Confirm new password</FieldLabel>
          <div style={{ position: "relative" }}>
            <InputField
              id="sec-confirm"
              type={showPw.confirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              aria-label={showPw.confirm ? "Hide password" : "Show password"}
              onClick={() => toggleShow("confirm")}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-secondary)", fontSize: 16, padding: 0,
              }}
            >
              <i className={`ti ${showPw.confirm ? "ti-eye-off" : "ti-eye"}`} />
            </button>
          </div>
          {/* Mismatch hint */}
          {form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p style={{ fontSize: 11, color: "var(--color-text-danger, #b91c1c)", marginTop: 4 }}>
              <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 12, marginRight: 4 }} />
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      <SaveBar onSave={handleSave} saveLabel="Update password" />
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import Card, { SectionLabel } from "./ui/Card";
import { FieldLabel, InputField, ReadOnlyField } from "./ui/FormFields";
import { Toggle } from "./ui/FormFields";
import SaveBar from "./ui/SaveBar";

/* ── Avatar initials ── */
function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: 50, height: 50, borderRadius: "50%",
        background: "#800000",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>{initials}</span>
    </div>
  );
}

/* ── Role badge ── */
function RoleBadge({ role }) {
  const label = role === "admin" ? "Admin account"
    : role === "instructor" ? "Instructor account"
    : "Student account";
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10, fontWeight: 500,
        padding: "1px 8px",
        borderRadius: 20,
        background: "rgba(128,0,0,0.08)",
        color: "#800000",
        border: "1px solid #e8c5c5",
      }}
    >
      {label}
    </span>
  );
}

export default function ProfileInformation({ role: roleProp, name: nameProp, email: emailProp }) {
  const role                = roleProp || "student";
  const [userId, setUserId] = useState(null);

  const [form, setForm] = useState({
    fullName:  nameProp  || "",
    email:     emailProp || "",
    contact:   "",
    studentId: "",   // irreversible once saved
  });

  // Track whether studentId has been permanently locked (saved once with a value)
  const [studentIdLocked, setStudentIdLocked] = useState(false);

  // Dark mode toggle — synced to <html class="dark"> and localStorage
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    document.documentElement.classList.toggle("dark", value);
    localStorage.setItem("theme", value ? "dark" : "light");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) return;
        const { user } = await res.json();
        setUserId(user?.id || null);
        setForm(f => ({
          ...f,
          fullName: user?.full_name || f.fullName,
          email:    user?.email     || f.email,
        }));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (userId) {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: form.fullName, email: form.email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save profile");
      }
    }
    // Lock studentId permanently in this session once saved with a value
    if (form.studentId && !studentIdLocked) {
      setStudentIdLocked(true);
    }
  };

  return (
    <Card>
      {/* Avatar + identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <Avatar name={form.fullName || "PUP User"} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>
            {form.fullName || "—"}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            {form.email || "—"}
          </div>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* ── Identity section ── */}
      <SectionLabel>
        <i className="ti ti-user" aria-hidden="true" style={{ fontSize: 15, marginRight: 6 }} />
        Identity
      </SectionLabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Full name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel htmlFor="pf-fullName">Full name</FieldLabel>
          <InputField
            id="pf-fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>

        {/* Email */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel htmlFor="pf-email">Email address</FieldLabel>
          <InputField
            id="pf-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@pup.edu.ph"
          />
        </div>

        {/* Contact */}
        <div style={{ gridColumn: "1 / -1" }}>
          <FieldLabel htmlFor="pf-contact">Contact number</FieldLabel>
          <InputField
            id="pf-contact"
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="+63 9XX XXX XXXX"
          />
        </div>
      </div>

      {/* ── Student-only fields ── */}
      {role === "student" && (
        <>
          <SectionLabel>
            <i className="ti ti-id-badge" aria-hidden="true" style={{ fontSize: 15, marginRight: 6 }} />
            Student information
          </SectionLabel>

          <div style={{ marginBottom: 16 }}>
            <FieldLabel htmlFor="pf-studentId">Student ID</FieldLabel>

            {studentIdLocked ? (
              <ReadOnlyField id="pf-studentId" value={form.studentId} />
            ) : (
              <>
                <InputField
                  id="pf-studentId"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 2021-00001-MN-0"
                />
                {form.studentId && (
                  <p style={{ fontSize: 11, color: "var(--color-text-danger, #b91c1c)", marginTop: 4 }}>
                    <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 12, marginRight: 4 }} />
                    Once saved, this cannot be changed.
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Appearance section ── */}
      <SectionLabel>
        <i className="ti ti-moon" aria-hidden="true" style={{ fontSize: 15, marginRight: 6 }} />
        Appearance
      </SectionLabel>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderRadius: "var(--radius-inner)",
          border: "0.5px solid var(--color-border-tertiary)",
          background: "var(--color-background-secondary)",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
            Dark mode
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
            {darkMode ? "Dark theme is on" : "Light theme is on"}
          </div>
        </div>
        <Toggle
          id="pf-darkmode"
          checked={darkMode}
          onChange={toggleDarkMode}
          label="Toggle dark mode"
        />
      </div>

      <SaveBar onSave={handleSave} saveLabel="Save profile" />
    </Card>
  );
}

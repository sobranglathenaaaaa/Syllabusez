import { cookies } from "next/headers";
import { DashboardLayoutShell } from "@/components/dashboard/DashboardLayoutShell";
import ProfileInformation from "@/components/settings/ProfileInformation";
import SecuritySettings from "@/components/settings/SecuritySettings";
import About from "@/components/settings/About";

export const metadata = {
  title: "Settings — Syllabusez",
  description: "Manage your profile, security, and system preferences.",
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const role  = cookieStore.get("session_role")?.value  || "student";
  const name  = decodeURIComponent(cookieStore.get("session_name")?.value  || "PUP User");
  const email = cookieStore.get("session_email")?.value || `${role}@pup.edu.ph`;

  return (
    <DashboardLayoutShell user={{ role, name, email }}>
      {/* Accessibility heading */}
      <h2 className="sr-only">Account settings — profile, security, and system information</h2>

      <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            aria-hidden="true"
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: "#800000",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="ti ti-settings" style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>
              Settings
            </h1>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "2px 0 0" }}>
              Update your profile, security, and system information from one place.
            </p>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Profile */}
          <section>
            <ProfileInformation role={role} name={name} email={email} />
          </section>

          {/* Security */}
          <section>
            <SecuritySettings />
          </section>

          {/* About — full width */}
          <section style={{ gridColumn: "1 / -1" }}>
            <About role={role} />
          </section>

        </div>
      </div>
    </DashboardLayoutShell>
  );
}
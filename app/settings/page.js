import { cookies } from "next/headers";
import { DashboardLayoutShell } from "@/components/dashboard/DashboardLayoutShell";
import ProfileInformation from "@/components/settings/ProfileInformation";
import SecuritySettings from "@/components/settings/SecuritySettings";
import About from "@/components/settings/About";

export const metadata = {
  title: "Settings",
  description: "User settings and preferences."
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_role")?.value || "student";
  const name = decodeURIComponent(cookieStore.get("session_name")?.value || "PUP User");
  const email = cookieStore.get("session_email")?.value || `${role}@pup.edu.ph`;

  return (
    <DashboardLayoutShell user={{ role, name, email }}>
      <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/5 via-transparent to-amber-50/40" />
          <div className="relative flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#800000]">Account preferences</span>
            <h1 className="text-3xl font-black text-gray-900">Settings</h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500">
              Update your profile, security, and system information from one place.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Profile</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">Basic identity and contact details.</p>
            </div>
            <ProfileInformation />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">Security</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">Password and authentication settings.</p>
            </div>
            <SecuritySettings />
          </section>

          <section className="space-y-3 xl:col-span-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">About</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">System information and policy details.</p>
            </div>
            <About />
          </section>
        </div>
      </div>
    </DashboardLayoutShell>
  );
}
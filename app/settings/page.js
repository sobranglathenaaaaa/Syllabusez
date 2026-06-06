



import ProfileInformation from '@/components/settings/ProfileInformation';
import SecuritySettings from '@/components/settings/SecuritySettings';
import About from '@/components/settings/About';
import { DashboardLayoutShell } from '@/components/dashboard/DashboardLayoutShell';

export const metadata = {
  title: 'Settings',
  description: 'User settings and preferences.'
};

export default function SettingsPage() {
  const dummyUser = { role: "admin", name: "Admin Dela Cruz", email: "admin@pup.edu.ph" };
  return (
    <DashboardLayoutShell user={dummyUser}>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg glassmorphism space-y-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        {/* Sections */}
        <section id="profile"><ProfileInformation /></section>
        <section id="security"><SecuritySettings /></section>
        <section id="about"><About /></section>
      </div>
    </DashboardLayoutShell>
  );
}

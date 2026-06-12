




import FeatureAccordion from '@/components/settings/FeatureAccordion';
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
        <section id="features" className="pt-4 border-t border-gray-100">
          <h2 className="text-xl font-bold mb-2">Portal Features</h2>
          <p className="text-sm text-gray-500 mb-4">Explore the core capabilities of Syllabusez.</p>
          <FeatureAccordion />
        </section>
      </div>
    </DashboardLayoutShell>
  );
}

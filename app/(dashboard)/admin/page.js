import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function AdminDashboard() {
  return (
    <DashboardShell title="Admin Dashboard" role="admin">
      <section className="rounded border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Administration</h2>
        <p className="mt-2 text-sm text-zinc-600">Manage departments, courses, and syllabus approvals.</p>
      </section>
    </DashboardShell>
  );
}

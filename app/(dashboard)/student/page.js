import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function StudentDashboard() {
  return (
    <DashboardShell title="Student Dashboard" role="student">
      <section className="rounded border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Enrolled Syllabi</h2>
        <p className="mt-2 text-sm text-zinc-600">View approved syllabi and weekly plans from your enrolled courses.</p>
      </section>
    </DashboardShell>
  );
}

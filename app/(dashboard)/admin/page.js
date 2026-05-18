import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { query } from "@/lib/db";
import Link from "next/link";

async function getAdminStats() {
  try {
    const [instructors] = await query("SELECT COUNT(*) as count FROM profiles WHERE role = 'instructor'");
    const [students] = await query("SELECT COUNT(*) as count FROM profiles WHERE role = 'student'");
    const [approved] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'approved'");
    const [pending] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'submitted'");
    const [departments] = await query("SELECT COUNT(*) as count FROM departments");
    return {
      instructors: instructors?.count ?? 0,
      students: students?.count ?? 0,
      approved: approved?.count ?? 0,
      pending: pending?.count ?? 0,
      departments: departments?.count ?? 0,
    };
  } catch {
    return { instructors: 0, students: 0, approved: 0, pending: 0, departments: 0 };
  }
}

async function getPendingApprovals() {
  try {
    const rows = await query(`
      SELECT s.id, c.code, c.title as course_title, p.full_name as instructor_name, s.created_at
      FROM syllabi s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN profiles p ON s.instructor_id = p.id
      WHERE s.status = 'submitted'
      ORDER BY s.created_at DESC
      LIMIT 5
    `);
    return rows || [];
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const pendingApprovals = await getPendingApprovals();

  return (
    <DashboardShell title="Admin Dashboard" role="admin">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Instructors', value: String(stats.instructors), color: 'bg-blue-50 text-blue-700' },
            { label: 'Total Students', value: String(stats.students), color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Approved Syllabi', value: String(stats.approved), color: 'bg-green-50 text-green-700' },
            { label: 'Pending Review', value: String(stats.pending), color: 'bg-amber-50 text-amber-700' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Actions + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Pending Syllabus Approvals</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.code} - {item.course_title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Submitted by {item.instructor_name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">Approve</button>
                      <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">Review</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center text-gray-500 text-sm">
                  There are no syllabi pending approval at this time.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/users" className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-medium transition-colors border border-transparent hover:border-red-100">
                <span>Manage Users</span>
                <span>→</span>
              </Link>
              <button className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-medium transition-colors border border-transparent hover:border-red-100">
                <span>Manage Departments</span>
                <span>→</span>
              </button>
              <button className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-medium transition-colors border border-transparent hover:border-red-100">
                <span>Review Syllabi</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

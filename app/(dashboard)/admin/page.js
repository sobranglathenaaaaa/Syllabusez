import { cookies } from "next/headers";
import { Greeting } from "@/components/dashboard/Greeting";
import { AdminDashboardContent } from "@/components/dashboard/AdminDashboardContent";
import { query } from "@/lib/db";
import Link from "next/link";
import { Users, FileText, CheckSquare, Layers } from "lucide-react";

async function getAdminStats() {
  try {
    const [instructors] = await query("SELECT COUNT(*) as count FROM profiles WHERE role = 'instructor'");
    const [students] = await query("SELECT COUNT(*) as count FROM profiles WHERE role = 'student'");
    const [approved] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'approved'");
    const [pending] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'submitted'");
    return {
      instructors: instructors?.count ?? 0,
      students: students?.count ?? 0,
      approved: approved?.count ?? 0,
      pending: pending?.count ?? 0,
    };
  } catch (error) {
    console.error("Failed to query admin stats:", error);
    return { instructors: 0, students: 0, approved: 0, pending: 0 };
  }
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const name = decodeURIComponent(cookieStore.get("session_name")?.value || "Administrator");
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* 1. Greeting Banner */}
      <Greeting fullName={name} />

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Instructors", value: String(stats.instructors), color: "bg-blue-50 text-blue-700 border-blue-100", icon: Users },
          { label: "Enrolled Students", value: String(stats.students), color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: Users },
          { label: "Approved Syllabi", value: String(stats.approved), color: "bg-green-50 text-green-700 border-green-100", icon: FileText },
          { label: "Pending Approvals", value: String(stats.pending), color: "bg-amber-50 text-amber-700 border-amber-100", icon: CheckSquare, badge: stats.pending > 0 ? "Action Required" : null },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className={`p-4 rounded-xl border ${stat.color} mr-4 transition-transform group-hover:scale-110 duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 block leading-tight">{stat.value}</span>
                <span className="text-xs font-semibold text-gray-400 block mt-0.5">{stat.label}</span>
                {stat.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[8px] font-extrabold uppercase bg-red-100 text-red-700 rounded-md border border-red-200">
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Admin Workspace (Approvals Panel + Quick Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Pendings approvals table */}
        <div className="lg:col-span-2">
          <AdminDashboardContent />
        </div>

        {/* Right 1 Column: Quick Action Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Quick Shortcuts</h3>
            <div className="space-y-3">
              <Link href="/admin/users" className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-red-100 group">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400 group-hover:text-red-700" />
                  <span>Manage Instructors & Students</span>
                </div>
                <span className="font-extrabold text-sm transition-transform group-hover:translate-x-0.5">→</span>
              </Link>

              <button className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-red-100 group">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-gray-400 group-hover:text-red-700" />
                  <span>Curriculum Programs</span>
                </div>
                <span className="font-extrabold text-sm transition-transform group-hover:translate-x-0.5">→</span>
              </button>

              <Link href="/admin/syllabi" className="w-full py-3 px-4 flex justify-between items-center bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-800 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-red-100 group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400 group-hover:text-red-700" />
                  <span>Syllabus Directory List</span>
                </div>
                <span className="font-extrabold text-sm transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>

          {/* Academic Info Banner */}
          <div className="bg-gradient-to-br from-[#800000] to-red-950 text-white rounded-3xl p-6 shadow-sm border border-red-950/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mb-10" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Quality Assurance</span>
            <h4 className="font-extrabold text-base mt-2">PUP Curriculum Management</h4>
            <p className="text-xs text-white/70 leading-relaxed mt-2 font-medium">
              Ensure all course syllabi align with outcomes-based education standards. Syllabi must undergo verification by branch department chairpersons prior to catalog publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

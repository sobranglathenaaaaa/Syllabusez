import { cookies } from "next/headers";
import { Greeting } from "@/components/dashboard/Greeting";
import { query } from "@/lib/db";
import Link from "next/link";
import { FileText, Clock, CheckCircle, File, Plus, Edit2, Eye } from "lucide-react";

async function getInstructorStats(instructorId) {
  try {
    const [total] = await query("SELECT COUNT(*) as count FROM syllabi WHERE instructor_id = ?", [instructorId]);
    const [drafts] = await query("SELECT COUNT(*) as count FROM syllabi WHERE instructor_id = ? AND status = 'draft'", [instructorId]);
    const [pending] = await query("SELECT COUNT(*) as count FROM syllabi WHERE instructor_id = ? AND status = 'submitted'", [instructorId]);
    const [approved] = await query("SELECT COUNT(*) as count FROM syllabi WHERE instructor_id = ? AND status = 'approved'", [instructorId]);
    return {
      total: total?.count ?? 0,
      drafts: drafts?.count ?? 0,
      pending: pending?.count ?? 0,
      approved: approved?.count ?? 0,
    };
  } catch (error) {
    console.error("Failed to query instructor stats:", error);
    return { total: 0, drafts: 0, pending: 0, approved: 0 };
  }
}

async function getRecentSyllabi(instructorId) {
  try {
    const rows = await query(
      `SELECT s.id, c.code, c.title as course_title, s.status, s.version, s.updated_at 
       FROM syllabi s 
       LEFT JOIN courses c ON s.course_id = c.id 
       WHERE s.instructor_id = ? 
       ORDER BY s.updated_at DESC 
       LIMIT 5`,
      [instructorId]
    );
    return rows || [];
  } catch (error) {
    console.error("Failed to query recent syllabi:", error);
    return [];
  }
}

export default async function InstructorDashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;
  const name = decodeURIComponent(cookieStore.get("session_name")?.value || "Professor");
  
  const stats = await getInstructorStats(userId);
  const recentSyllabi = await getRecentSyllabi(userId);

  // Status Badge helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case "submitted":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Submitted</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg inline-flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Changes Required</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg inline-flex items-center gap-1">
            <File className="w-3 h-3" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Greeting Banner */}
      <Greeting fullName={name} />

      {/* 2. Topbar Actions & Stats Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Curriculum Dashboard</h3>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Syllabus Builder Controls</p>
        </div>
        
        <Link
          href="/instructor/syllabi/new"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#800000] hover:bg-red-900 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-800/10 transition-all hover:scale-[1.01] active:scale-[0.99] flex-shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create New Syllabus</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Managed", value: String(stats.total), color: "bg-blue-50 text-blue-700 border-blue-100", icon: FileText },
          { label: "Active Drafts", value: String(stats.drafts), color: "bg-gray-50 text-gray-700 border-gray-200", icon: File },
          { label: "Awaiting Review", value: String(stats.pending), color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
          { label: "Approved Syllabi", value: String(stats.approved), color: "bg-green-50 text-green-700 border-green-100", icon: CheckCircle },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className={`p-4 rounded-xl border ${stat.color} mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900 block leading-tight">{stat.value}</span>
                <span className="text-xs font-semibold text-gray-400 block mt-0.5">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Recent Syllabi Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">Recent Submissions & Drafts</h4>
          <Link href="/instructor/syllabi" className="text-xs font-bold text-[#800000] hover:text-red-700 hover:underline">
            View All Syllabi
          </Link>
        </div>

        {recentSyllabi.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Version</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSyllabi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-red-900 block">{item.code}</span>
                      <span className="text-xs font-medium text-gray-700 block mt-0.5">{item.course_title}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-extrabold text-gray-700">v{item.version}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-400">
                      {new Date(item.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status === "draft" || item.status === "rejected" || item.status === "submitted" ? (
                          <Link
                            href={`/instructor/syllabi/${item.id}/edit`}
                            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-700 hover:text-red-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                        ) : (
                          <Link
                            href="/instructor/syllabi"
                            className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View details</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-red-50 text-[#800000] rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">No syllabi yet</h4>
            <p className="text-xs text-gray-400 font-medium">
              You haven't created any course syllabi yet. Click the "Create New Syllabus" button above to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline fallback for missing XCircle
function XCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <circle cx={12} cy={12} r={10} />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}

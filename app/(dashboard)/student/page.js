import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { query } from "@/lib/db";
import Link from "next/link";

async function getStudentStats() {
  try {
    const [enrolled] = await query("SELECT COUNT(*) as count FROM enrollments");
    const [syllabi] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'approved'");
    return {
      enrolled: enrolled?.count ?? 0,
      syllabi: syllabi?.count ?? 0,
    };
  } catch {
    return { enrolled: 0, syllabi: 0 };
  }
}

async function getEnrolledCourses() {
  try {
    const rows = await query(`
      SELECT c.id, c.code, c.title, p.full_name as instructor_name
      FROM courses c
      LEFT JOIN syllabi s ON s.course_id = c.id AND s.status = 'approved'
      LEFT JOIN profiles p ON s.instructor_id = p.id
      ORDER BY c.code ASC
      LIMIT 12
    `);
    return rows || [];
  } catch {
    return [];
  }
}

export default async function StudentDashboard() {
  const stats = await getStudentStats();
  const courses = await getEnrolledCourses();

  return (
    <DashboardShell title="Student Dashboard" role="student">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { label: 'Enrolled Courses', value: String(stats.enrolled), color: 'bg-blue-50 text-blue-700' },
            { label: 'Available Syllabi', value: String(stats.syllabi), color: 'bg-green-50 text-green-700' },
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

        {/* Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
          </div>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-red-800 mb-1">{course.code}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{course.instructor_name || 'TBA'}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <button className="w-full py-2 bg-gray-50 hover:bg-red-50 text-red-800 text-sm font-medium rounded-lg transition-colors border border-gray-100 hover:border-red-200">
                        View Syllabus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-12 text-center text-gray-500 text-sm">
              You are not enrolled in any courses yet.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

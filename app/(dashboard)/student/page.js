import { cookies } from "next/headers";
import { Greeting } from "@/components/dashboard/Greeting";
import { StudentDashboardContent } from "@/components/dashboard/StudentDashboardContent";
import { query } from "@/lib/db";
import { BookOpen } from "lucide-react";

async function getStudentCourses(studentId) {
  try {
    const rows = await query(
      `SELECT c.id, c.code, c.title, c.units, 
              p.full_name as instructor_name,
              s.id as syllabus_id,
              s.status as syllabus_status,
              s.version as syllabus_version
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN syllabi s ON s.course_id = c.id AND s.status = 'approved'
       LEFT JOIN profiles p ON s.instructor_id = p.id
       WHERE e.user_id = ?
       ORDER BY c.code ASC`,
      [studentId]
    );
    return rows || [];
  } catch (error) {
    console.error("Failed to query student courses:", error);
    return [];
  }
}

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;
  const name = decodeURIComponent(cookieStore.get("session_name")?.value || "Student");

  const courses = await getStudentCourses(userId);

  return (
    <div className="space-y-8">
      {/* 1. Greeting Banner */}
      <Greeting fullName={name} />

      {/* 2. Headline Title */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#800000]" />
          <span>My Enrolled Courses</span>
        </h3>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
          Academic Term Core Catalog
        </p>
      </div>

      {/* 3. Course Cards Container */}
      {courses.length > 0 ? (
        <StudentDashboardContent courses={courses} />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center max-w-md mx-auto shadow-sm">
          <div className="p-4 bg-red-50 text-[#800000] rounded-full w-fit mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-sm text-gray-900 mt-4">No enrolled courses</h4>
          <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">
            You are not enrolled in any courses for the current academic term. Please contact your campus registrar.
          </p>
        </div>
      )}
    </div>
  );
}

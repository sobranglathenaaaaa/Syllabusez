import { cookies } from "next/headers";
import { Greeting } from "@/components/dashboard/Greeting";
import { StudentDashboardContent } from "@/components/dashboard/StudentDashboardContent";
import { supabase } from "@/lib/db";
import { BookOpen } from "lucide-react";

async function getStudentCourses(studentId) {
  try {
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(`
        course_id,
        courses ( id, code, title, units )
      `)
      .eq("user_id", studentId);
      
    if (error || !enrollments) return [];
    
    const courseIds = enrollments.map(e => e.course_id).filter(Boolean);
    if (courseIds.length === 0) return [];

    const { data: syllabi } = await supabase
      .from("syllabi")
      .select(`
        id, course_id, status, version,
        users ( full_name )
      `)
      .in("course_id", courseIds)
      .eq("status", "approved");
      
    const courses = enrollments.map(e => {
      const c = e.courses || {};
      const s = syllabi?.find(syl => syl.course_id === c.id) || {};
      return {
        id: c.id,
        code: c.code,
        title: c.title,
        units: c.units,
        instructor_name: s.users?.full_name || null,
        syllabus_id: s.id || null,
        syllabus_status: s.status || null,
        syllabus_version: s.version || null
      };
    });
    
    courses.sort((a, b) => (a.code || "").localeCompare(b.code || ""));
    return courses;
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

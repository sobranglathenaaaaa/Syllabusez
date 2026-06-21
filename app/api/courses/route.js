import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const programId = url.searchParams.get("program_id");
    // Server-side role enforcement: if requester is a student, force their program_id
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;
    let effectiveProgramId = programId;
    if (userId) {
      const { data: user, error: userErr } = await supabase.from("users").select("role, program_id").eq("id", userId).single();
      if (!userErr && user) {
        if (user.role === "student") {
          effectiveProgramId = user.program_id;
        }
      }
    }
    let query = supabase
      .from("courses")
      .select("id, code, title, units, program_id, prereq, coreq, year_level, semester, lecture_hours, lab_hours")
      .order("code", { ascending: true });

    if (effectiveProgramId) {
      query = query.eq("program_id", effectiveProgramId);
    }

    const { data: courses, error } = await query;
    if (error) throw error;

    // Fetch instructor details for each course
    const coursesWithInstructors = await Promise.all(
      courses.map(async (course) => {
        const { data: courseInstructors, error: ciError } = await supabase
          .from("course_instructors")
          .select("instructor_id, users(id, full_name, email, role)")
          .eq("course_id", course.id);
        
        if (ciError) {
          console.error(`Failed to fetch instructors for course ${course.code || course.id}:`, ciError);
          return { ...course, instructors: [] };
        }

        const instructors = courseInstructors?.map(ci => ({
          id: ci.users.id,
          full_name: ci.users.full_name,
          email: ci.users.email
        })) || [];

        return { 
          ...course, 
          instructors,
          lectureHours: course.lecture_hours,
          labHours: course.lab_hours
        };
      })
    );

    return NextResponse.json({ courses: coursesWithInstructors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

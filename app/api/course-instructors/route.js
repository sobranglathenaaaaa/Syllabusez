import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { course_id, instructor_ids } = await request.json();

    if (!course_id || !Array.isArray(instructor_ids)) {
      return NextResponse.json({ error: "Missing course_id or instructor_ids array" }, { status: 400 });
    }

    // First delete existing assignments for this course
    await supabase.from("course_instructors").delete().eq("course_id", course_id);

    // Then insert the new ones
    if (instructor_ids.length > 0) {
      const inserts = instructor_ids.map(id => ({ course_id, instructor_id: id }));
      const { error: insertError } = await supabase.from("course_instructors").insert(inserts);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update course instructors:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

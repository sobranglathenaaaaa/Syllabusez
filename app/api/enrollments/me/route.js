import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("user_id", userId);

    if (error) throw error;
    
    const courseIds = enrollments.map(e => e.course_id);
    return NextResponse.json({ courseIds });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

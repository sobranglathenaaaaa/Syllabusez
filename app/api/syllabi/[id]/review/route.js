import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const role = cookieStore.get("session_role")?.value;

    if (role !== "admin") {
      return NextResponse.json({ error: "Access Denied. Only Administrators can review syllabi." }, { status: 403 });
    }

    const { status, comment } = await request.json();

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid review status. Must be 'approved' or 'rejected'." }, { status: 400 });
    }

    const { error } = await supabase
      .from("syllabi")
      .update({
        status,
        approval_comment: comment || null
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Syllabus status successfully updated to ${status}.` });
  } catch (error) {
    console.error("POST Syllabus Review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

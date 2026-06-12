import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, program_id")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
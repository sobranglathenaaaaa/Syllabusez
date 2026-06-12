import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (!newPassword) return NextResponse.json({ error: "Missing newPassword" }, { status: 400 });

    const { data: user, error: uErr } = await supabase.from("users").select("password").eq("id", userId).single();
    if (uErr) throw uErr;

    // NOTE: replace with hashed verification in production
    if (user.password && currentPassword !== user.password) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const { error: updErr } = await supabase.from("users").update({ password: newPassword }).eq("id", userId);
    if (updErr) throw updErr;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

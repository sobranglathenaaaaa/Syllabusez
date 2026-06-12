import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

// GET /api/users — list all users with optional search/filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    let query = supabase
      .from("users")
      .select("id, full_name, email, role, program_id, programs(name), created_at")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq("role", role);
    }

    const { data: rows, error } = await query;

    if (error) throw error;

    return NextResponse.json({ users: rows || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users — create a single user
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, full_name, role, password, program } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!role || !["admin", "instructor", "student"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required (admin, instructor, student)" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("users")
      .insert([{
        id,
        full_name: full_name || null,
        email,
        role,
        password: password || null,
        program_id: (["student", "instructor"].includes(role) && program) ? program : null
      }]);

    if (error) {
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // 23505 is Postgres unique violation
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

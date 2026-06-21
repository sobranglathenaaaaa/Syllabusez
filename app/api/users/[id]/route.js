import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

// DELETE /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, full_name, role, password, program } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!role || !["admin", "instructor", "student"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required (admin, instructor, student)" }, { status: 400 });
    }

    const updateData = {
      email,
      full_name: full_name || null,
      role,
      program_id: (["student", "instructor"].includes(role) && program) ? program : null,
    };

    if (password && password.trim().length > 0) {
      // Always re-hash when a new password is explicitly provided
      updateData.password = await bcrypt.hash(password.trim(), BCRYPT_ROUNDS);
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id);

    if (error) {
      if (error.code === '23505') { // Postgres unique violation
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

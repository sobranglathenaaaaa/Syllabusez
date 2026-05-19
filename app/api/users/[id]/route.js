import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// DELETE /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query("DELETE FROM users WHERE id = ?", [id]);
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
    const { email, full_name, role, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!role || !["admin", "instructor", "student"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required (admin, instructor, student)" }, { status: 400 });
    }

    if (password && password.trim().length > 0) {
      await query(
        "UPDATE users SET email = ?, full_name = ?, role = ?, password = ? WHERE id = ?",
        [email, full_name || null, role, password.trim(), id]
      );
    } else {
      await query(
        "UPDATE users SET email = ?, full_name = ?, role = ? WHERE id = ?",
        [email, full_name || null, role, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

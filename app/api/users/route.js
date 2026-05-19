import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

// GET /api/users — list all users with optional search/filter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    let sql = "SELECT id, full_name, email, role, created_at FROM users WHERE 1=1";
    const values = [];

    if (search) {
      sql += " AND (full_name LIKE ? OR email LIKE ?)";
      values.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      sql += " AND role = ?";
      values.push(role);
    }

    sql += " ORDER BY created_at DESC";

    const rows = await query(sql, values);
    return NextResponse.json({ users: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users — create a single user
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, full_name, role, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!role || !["admin", "instructor", "student"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required (admin, instructor, student)" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await query(
      "INSERT INTO users (id, full_name, email, role, password) VALUES (?, ?, ?, ?, ?)",
      [id, full_name || null, email, role, password || null]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

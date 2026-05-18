import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

// POST /api/users/batch — batch upload students only (CSV/Excel parsed on client)
export async function POST(request) {
  try {
    const body = await request.json();
    const { users } = body;

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "No users provided" }, { status: 400 });
    }

    const results = { success: 0, failed: 0, errors: [] };

    for (const user of users) {
      const { email, lastname, firstname, middlename } = user;

      if (!email) {
        results.failed++;
        results.errors.push({ email: email || "(empty)", reason: "Email is required" });
        continue;
      }

      const fullName = [lastname, firstname, middlename].filter(Boolean).join(", ");
      const id = crypto.randomUUID();

      try {
        await query(
          "INSERT INTO profiles (id, full_name, email, role) VALUES (?, ?, ?, 'student')",
          [id, fullName || null, email.trim().toLowerCase()]
        );
        results.success++;
      } catch (err) {
        results.failed++;
        if (err.code === "ER_DUP_ENTRY") {
          results.errors.push({ email, reason: "Email already exists" });
        } else {
          results.errors.push({ email, reason: err.message });
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

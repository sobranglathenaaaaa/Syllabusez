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

    const results = { success: 0, failed: 0, errors: [], imported: [] };

    for (const user of users) {
      const { email, lastname, firstname, middlename, password } = user;

      if (!email) {
        results.failed++;
        results.errors.push({ email: email || "(empty)", reason: "Email is required" });
        continue;
      }

      const fullName = [lastname, firstname, middlename].filter(Boolean).join(", ");
      const id = crypto.randomUUID();

      // Auto-generate default password if none is provided
      const emailPrefix = email.split("@")[0] || "student";
      const generatedPassword = `pup_${emailPrefix}`;
      const activePassword = (password && password.trim()) || generatedPassword;

      try {
        await query(
          "INSERT INTO users (id, full_name, email, role, password) VALUES (?, ?, ?, 'student', ?)",
          [id, fullName || null, email.trim().toLowerCase(), activePassword]
        );
        results.success++;
        results.imported.push({ email: email.trim().toLowerCase(), fullName, password: activePassword });
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

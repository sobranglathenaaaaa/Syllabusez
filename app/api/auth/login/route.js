import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { roleHomePath } from "@/types/roles";

const BCRYPT_ROUNDS = 12;

export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  // Fetch user record (including stored password) — server-side only, never returned to client
  const { data: userRows, error: dbError } = await supabase
    .from("users")
    .select("id, email, role, full_name, password")
    .eq("email", email.trim().toLowerCase())
    .limit(1);

  if (dbError) {
    console.error("DB error during login:", dbError);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  const user = userRows?.[0];

  // Generic message — avoids leaking whether an email is registered
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!user.password) {
    return NextResponse.json(
      { error: "This account has no password set. Contact your administrator." },
      { status: 401 }
    );
  }

  // --- Password verification with auto-migration ---
  const isHashed = user.password.startsWith("$2");
  let passwordValid = false;

  if (isHashed) {
    // Modern path: bcrypt comparison
    passwordValid = await bcrypt.compare(password, user.password);
  } else {
    // Legacy path: plaintext comparison (passwords not yet migrated)
    passwordValid = user.password.trim() === password;

    if (passwordValid) {
      // Silently upgrade to bcrypt hash on successful login
      try {
        const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await supabase
          .from("users")
          .update({ password: hashed })
          .eq("id", user.id);
      } catch (hashErr) {
        // Non-fatal — login still succeeds even if re-hash fails
        console.error("Failed to upgrade password hash:", hashErr);
      }
    }
  }

  if (!passwordValid) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!roleHomePath[user.role]) {
    return NextResponse.json(
      { error: "Your account has an invalid role. Contact your administrator." },
      { status: 403 }
    );
  }

  // Set httpOnly cookies server-side (not readable by browser JS)
  const cookieStore = await cookies();
  const cookieOptions = { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 };
  cookieStore.set("session_role", user.role, cookieOptions);
  cookieStore.set("session_user_id", user.id, cookieOptions);
  cookieStore.set("session_email", user.email, cookieOptions);
  cookieStore.set("session_name", user.full_name || "PUP User", cookieOptions);

  return NextResponse.json({ redirectTo: roleHomePath[user.role] });
}

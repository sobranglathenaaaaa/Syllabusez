import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { seedDatabase } from "@/lib/db-seed";
import { roleHomePath } from "@/types/roles";

const QUICK_LOGIN_PROFILES = {
  admin: {
    id: "a1a1a1a1-1111-4111-a111-111111111111",
    email: "admin@pup.edu.ph",
    full_name: "Admin Dela Cruz",
    role: "admin",
  },
  instructor: {
    id: "i2i2i2i2-2222-4222-i222-222222222222",
    email: "instructor@pup.edu.ph",
    full_name: "Staff Dela Cruz",
    role: "instructor",
  },
  student: {
    id: "s3s3s3s3-3333-4333-s333-333333333333",
    email: "student@pup.edu.ph",
    full_name: "Juan Dela Cruz",
    role: "student",
  },
};

export async function POST(request) {
  const body = await request.json();
  const { role } = body;

  const user = QUICK_LOGIN_PROFILES[role];

  if (!user) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // Ensure seed profiles exist in the database
  try {
    await seedDatabase(false);
  } catch (e) {
    console.warn("Seed failed during quick login:", e.message);
  }

  // Set httpOnly cookies server-side — same as the regular login route
  const cookieStore = await cookies();
  const cookieOptions = { httpOnly: true, sameSite: "lax", path: "/", maxAge: 3600 };
  cookieStore.set("session_role", user.role, cookieOptions);
  cookieStore.set("session_user_id", user.id, cookieOptions);
  cookieStore.set("session_email", user.email, cookieOptions);
  cookieStore.set("session_name", user.full_name, cookieOptions);

  return NextResponse.json({ redirectTo: roleHomePath[user.role] });
}

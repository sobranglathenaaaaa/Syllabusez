"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findOrCreateProfile } from "@/services/auth.service";
import { roleHomePath } from "@/types/roles";

export async function loginAction(_, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "student");

  if (!email || !roleHomePath[role]) {
    return { error: "Valid email and role are required." };
  }

  const profile = await findOrCreateProfile({ email, fullName, role });
  const cookieStore = await cookies();
  cookieStore.set("session_role", profile.role, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("session_user", profile.id, { httpOnly: true, sameSite: "lax", path: "/" });

  redirect(roleHomePath[profile.role]);
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findOrCreateUser } from "@/services/auth.service";
import { roleHomePath } from "@/types/roles";

export async function loginAction(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") || "").trim();
  const role = String(formData.get("role") || "student");

  if (!email || !roleHomePath[role]) {
    return { error: "Valid email and role are required." };
  }

  const user = await findOrCreateUser({ email, fullName, role });
  const cookieStore = await cookies();
  cookieStore.set("session_role", user.role, { httpOnly: true, sameSite: "lax", path: "/" });
  cookieStore.set("session_user", user.id, { httpOnly: true, sameSite: "lax", path: "/" });

  redirect(roleHomePath[user.role]);
}

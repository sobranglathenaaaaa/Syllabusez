import { NextResponse } from "next/server";
import { roleHomePath } from "@/types/roles";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "student";
  const target = roleHomePath[role] || "/student";

  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.set("session_role", role, { httpOnly: true, sameSite: "lax", path: "/" });
  return response;
}

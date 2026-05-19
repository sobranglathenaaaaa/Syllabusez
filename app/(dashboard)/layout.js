import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { DashboardLayoutShell } from "@/components/dashboard/DashboardLayoutShell";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_role")?.value;
  const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

  if (!role || !userId) {
    redirect("/");
  }

  // Fetch full profile details from the database
  let user = null;
  try {
    const users = await query("SELECT id, full_name, email, role FROM users WHERE id = ? LIMIT 1", [userId]);
    user = users[0];
  } catch (error) {
    console.error("Failed to query user profile in dashboard layout:", error);
  }

  if (!user) {
    // If not found in db, fallback to cookies or default
    const name = decodeURIComponent(cookieStore.get("session_name")?.value || "Guest User");
    const email = cookieStore.get("session_email")?.value || `${role}@pup.edu.ph`;
    user = { id: userId, full_name: name, email, role };
  }

  return (
    <DashboardLayoutShell user={{ id: user.id, name: user.full_name || "PUP User", email: user.email, role: user.role }}>
      {children}
    </DashboardLayoutShell>
  );
}

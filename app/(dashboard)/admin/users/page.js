import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <DashboardShell title="User Management" role="admin">
      <UserManagement />
    </DashboardShell>
  );
}

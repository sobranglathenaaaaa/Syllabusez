import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">User Management</h3>
      </div>
      <UserManagement />
    </div>
  );
}

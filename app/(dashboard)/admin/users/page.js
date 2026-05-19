import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">User Management</h3>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Academic Community Registry</p>
      </div>
      <UserManagement />
    </div>
  );
}

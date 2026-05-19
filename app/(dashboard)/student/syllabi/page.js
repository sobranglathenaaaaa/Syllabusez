import { cookies } from "next/headers";
import { SyllabusList } from "@/components/syllabus/SyllabusList";

export default async function StudentSyllabiPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_role")?.value;
  const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900">Syllabus Archive</h3>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Approved Campus Curriculum Catalogs</p>
      </div>
      <SyllabusList role={role} userId={userId} />
    </div>
  );
}

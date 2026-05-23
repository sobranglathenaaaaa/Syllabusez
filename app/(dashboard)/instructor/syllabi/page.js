import { cookies } from "next/headers";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SyllabusList } from "@/components/syllabus/SyllabusList";

export default async function InstructorSyllabiPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("session_role")?.value;
  const userId =
    cookieStore.get("session_user")?.value ||
    cookieStore.get("session_user_id")?.value;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          Syllabus Catalog
        </h3>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
          My Course Materials Registry
        </p>
      </div>

      {/* Syllabus List (contains search) */}
      <SyllabusList role={role} userId={userId} />

      {/* Create Button BELOW search */}
      <div className="flex justify-end">
        <Link
          href="/instructor/syllabi/new"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#800000] hover:bg-red-900 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-800/10 transition-all hover:scale-[1.01] active:scale-[0.99] flex-shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create New Syllabus</span>
        </Link>
      </div>
    </div>
  );
}
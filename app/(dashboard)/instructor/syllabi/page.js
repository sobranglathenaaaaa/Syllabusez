import { cookies } from "next/headers";
import Link from "next/link";
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
        <Link href="/instructor/syllabi/new">
          <button className="px-4 py-2 bg-[#800000] text-white rounded-xl hover:bg-[#a00000] transition-colors font-semibold shadow-sm">
            Create New Syllabus
          </button>
        </Link>
      </div>

    </div>
  );
}
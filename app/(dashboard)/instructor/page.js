import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SyllabusBuilder } from "@/components/syllabus/syllabus-builder";
import { saveSyllabusAction } from "./actions";
import { query } from "@/lib/db";

const initialDraft = {
  id: "local-draft",
  title: "",
  status: "draft",
  learning_outcomes: [{ description: "Describe course objectives.", order_index: 1 }],
  weekly_plans: [{ week: 1, topic: "Course Orientation", activities: "", assessments: "", materials: "", order_index: 1 }],
};

async function getInstructorStats() {
  try {
    const [classes] = await query("SELECT COUNT(*) as count FROM courses");
    const [drafts] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'draft'");
    const [pending] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'submitted'");
    const [approved] = await query("SELECT COUNT(*) as count FROM syllabi WHERE status = 'approved'");
    return {
      classes: classes?.count ?? 0,
      drafts: drafts?.count ?? 0,
      pending: pending?.count ?? 0,
      approved: approved?.count ?? 0,
    };
  } catch {
    return { classes: 0, drafts: 0, pending: 0, approved: 0 };
  }
}

export default async function InstructorDashboard() {
  const stats = await getInstructorStats();

  return (
    <DashboardShell title="Instructor Dashboard" role="instructor">
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'My Classes', value: String(stats.classes), color: 'bg-blue-50 text-blue-700' },
            { label: 'Draft Syllabi', value: String(stats.drafts), color: 'bg-gray-50 text-gray-700' },
            { label: 'Pending Approval', value: String(stats.pending), color: 'bg-amber-50 text-amber-700' },
            { label: 'Approved Syllabi', value: String(stats.approved), color: 'bg-green-50 text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area - Syllabus Builder */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Create / Edit Syllabus</h2>
            <p className="text-sm text-gray-500 mt-1">Draft your course syllabus and submit for administrative approval.</p>
          </div>
          <div className="p-6 bg-gray-50/30">
            <SyllabusBuilder initialDraft={initialDraft} onSave={saveSyllabusAction} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

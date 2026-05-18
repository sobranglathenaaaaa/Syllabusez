import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SyllabusBuilder } from "@/components/syllabus/syllabus-builder";
import { saveSyllabusAction } from "./actions";

const initialDraft = {
  id: "local-draft",
  title: "",
  status: "draft",
  learning_outcomes: [{ description: "Describe course objectives.", order_index: 1 }],
  weekly_plans: [{ week: 1, topic: "Course Orientation", activities: "", assessments: "", materials: "", order_index: 1 }],
};

export default function InstructorDashboard() {
  return (
    <DashboardShell title="Instructor Dashboard" role="instructor">
      <SyllabusBuilder initialDraft={initialDraft} onSave={saveSyllabusAction} />
    </DashboardShell>
  );
}

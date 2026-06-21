"use client";

import { AlertCircle } from "lucide-react";
import { groupCoursesByYearSemester, sortSemesters } from "@/lib/curriculum-layout";

/**
 * Strips course code from the beginning of a title if it leaked in during parsing.
 */
function stripCodeFromTitle(title, code) {
  if (!title || !code) return title || "";
  let cleaned = String(title).trim();
  // Remove leading course code (exact match)
  const esc = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  cleaned = cleaned.replace(new RegExp(`^${esc}[\\s\\-:\\u2013\\u2014]*`, "i"), "").trim();
  // Remove any generic leading code pattern (e.g. "GEED 032 ")
  cleaned = cleaned.replace(/^[A-Z]{2,8}[\s-]?[A-Z0-9]*\s*\d{1,4}[A-Z]?[\s\-:\u2013\u2014]+/i, "").trim();
  return cleaned || title;
}

function formatRequirementList(value) {
  const normalized = String(value || "").trim();
  if (!normalized || /^none$/i.test(normalized) || normalized === "—") {
    return <span className="text-[#9ca3af] italic">None</span>;
  }

  const parts = normalized
    .split(/\s*(?:,|;|\||\/| and )\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return <span className="text-[#9ca3af] italic">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-center xl:justify-start">
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className="inline-flex items-center rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-semibold text-[#374151]"
        >
          {part}
        </span>
      ))}
    </div>
  );
}

function SemesterTable({
  semesterName,
  semesterLabel,
  yearLabel,
  coursesList,
  showInstructors = false,
  onAssignInstructor,
}) {
  const totalUnits = coursesList.reduce((sum, course) => sum + (course.units || 0), 0);

  return (
    <div className="bg-white border border-[#e5e7eb]  overflow-hidden flex flex-col h-full rounded-xl">
      <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-4 py-2">
        <h5 className="font-extrabold text-sm text-[#111827]">{semesterLabel}</h5>
      </div>
      <div className="flex-1">
        <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#e5e7eb] text-[10px] font-bold text-[#4b5563] uppercase tracking-wider">
                <th className="px-3 py-2 w-20">Code</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-2 py-2 text-center w-12" title="Lecture Hours">Lec</th>
                <th className="px-2 py-2 text-center w-12" title="Lab Hours">Lab</th>
                <th className="px-2 py-2 text-center w-12" title="Units">Units</th>
                <th className="px-3 py-2 w-32">Pre/Co-req</th>
                {showInstructors && <th className="px-3 py-2 w-32 text-center">Instructors</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
            {coursesList.map((course, idx) => (
              <tr key={course.id || `${course.code}-${idx}`} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-3 py-2 font-bold text-[#111827] align-top whitespace-nowrap">{course.code}</td>
                <td className="px-3 py-2 text-[#1f2937] leading-snug align-top font-semibold">{stripCodeFromTitle(course.title, course.code)}</td>
                <td className="px-2 py-2 text-center font-bold text-[#030712]">{course.lecture_hours ?? course.lectureHours ?? 0}</td>
                <td className="px-2 py-2 text-center font-bold text-[#030712]">{course.lab_hours ?? course.labHours ?? 0}</td>
                <td className="px-2 py-2 text-center font-bold text-[#030712]">{course.units}</td>
                <td className="px-3 py-2 text-left align-top text-[10px] text-[#374151] font-medium">
                  <div className="flex flex-col gap-1">
                    {course.prereq && <div><span className="font-bold text-[#6b7280] mr-1">Pre:</span>{formatRequirementList(course.prereq)}</div>}
                    {course.coreq && <div><span className="font-bold text-[#6b7280] mr-1">Co:</span>{formatRequirementList(course.coreq)}</div>}
                    {!course.prereq && !course.coreq && <span className="text-[#9ca3af] italic">None</span>}
                  </div>
                </td>
                {showInstructors && (
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-center">
                      {course.instructors?.length > 0 ? (
                        course.instructors.map((inst) => (
                          <span
                            key={inst.id}
                            className="text-[10px] bg-[#eff6ff] text-[#1d4ed8] px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]"
                            title={inst.full_name}
                          >
                            {inst.full_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-[#9ca3af] italic">Unassigned</span>
                      )}
                      {onAssignInstructor && (
                        <button
                          type="button"
                          onClick={() => onAssignInstructor(course)}
                          className="text-[10px] text-[#800000] font-bold hover:underline mt-1"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-[#fafafa] border-t border-[#f3f4f6] font-bold text-[#111827]">
              <td colSpan={showInstructors ? 2 : 2} className="px-4 py-3 text-right uppercase tracking-wider text-[#6b7280] text-[10px]">
                Semester Totals:
              </td>
              <td className="px-4 py-3 text-center font-extrabold text-[#800000]">{totalUnits}</td>
              <td colSpan={showInstructors ? 3 : 2} className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DynamicCurriculumView({
  courses = [],
  emptyMessage = "No structured curriculum courses found for this program.",
  showInstructors = false,
  onAssignInstructor,
}) {
  if (!courses.length) {
    return (
      <div className="py-12 text-center text-[#6b7280] bg-[#f9fafb] rounded-2xl border border-[#f3f4f6] border-dashed">
        <AlertCircle className="w-8 h-8 text-[#f59e0b] mx-auto mb-2" />
        <span className="text-xs font-semibold">{emptyMessage}</span>
      </div>
    );
  }

  const { grouped, sortedYears } = groupCoursesByYearSemester(courses);

  return (
    <div className="space-y-10">
      {sortedYears.map((year) => {
        const yearSemesters = grouped[year];
        const sortedSemestersList = sortSemesters(Object.keys(yearSemesters));
        return (
          <div key={year} className="space-y-4">
            <h3 className="text-xl font-black text-[#111827] uppercase tracking-widest border-b-2 border-[#e6cccc] pb-2 mb-4">
              {year}
            </h3>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {sortedSemestersList.map((semester) => {
                const coursesList = yearSemesters[semester].filter((c) => !String(c.title).includes("(Elective)"));
                if (coursesList.length === 0) return null;
                return (
                  <div key={semester} className="h-full">
                    <SemesterTable
                      semesterName={semester}
                      semesterLabel={semester}
                      yearLabel={year}
                      coursesList={coursesList}
                      showInstructors={showInstructors}
                      onAssignInstructor={onAssignInstructor}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {/* Free Electives Section */}
      <div className="space-y-4 mt-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#800000] bg-[#fef2f2] border-l-4 border-[#800000] pl-3 py-1.5 rounded-r-lg">
          Elective Courses
        </h4>
        <SemesterTable
          semesterName="Electives"
          semesterLabel="Electives"
          yearLabel=""
          coursesList={courses.filter((c) => String(c.title).includes("(Elective)") || /^ELECTIVE/i.test(c.code)).map(c => ({...c, title: c.title.replace(" (Elective)", "")}))}
          showInstructors={showInstructors}
          onAssignInstructor={onAssignInstructor}
        />
      </div>
    </div>
  );
}
export default DynamicCurriculumView;

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
    return <span className="text-gray-400 italic">None</span>;
  }

  const parts = normalized
    .split(/\s*(?:,|;|\||\/| and )\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return <span className="text-gray-400 italic">None</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-center xl:justify-start">
      {parts.map((part, index) => (
        <span
          key={`${part}-${index}`}
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700"
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
    <div className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full rounded-2xl">
      <div className="bg-gradient-to-r from-[#800000]/10 to-red-50 border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#800000]">{yearLabel}</p>
          <h5 className="font-extrabold text-sm text-gray-900 leading-tight">{semesterLabel}</h5>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 border border-gray-200">
          {semesterName}
        </span>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-24">Course Code</th>
                <th className="px-4 py-3 min-w-[240px]">Course Title</th>
                <th className="px-4 py-3 text-center w-20">Lecture Hours</th>
                <th className="px-4 py-3 text-center w-20">Lab Hours</th>
                <th className="px-4 py-3 text-center w-20">Total Credit Units</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Pre-Requisites</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Co-Requisites</th>
                {showInstructors && <th className="px-4 py-3 w-48 text-center">Instructors</th>}
              </tr>
            </thead>          <tbody className="divide-y divide-gray-100">
            {coursesList.map((course, idx) => (
              <tr key={course.id || `${course.code}-${idx}`} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-900 align-top whitespace-nowrap">{course.code}</td>
                <td className="px-4 py-3 text-gray-800 leading-snug align-top font-semibold">{stripCodeFromTitle(course.title, course.code)}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-950">{course.lectureHours || 0}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-950">{course.labHours || 0}</td>
                <td className="px-4 py-3 text-center font-bold text-gray-950">{course.units}</td>
                <td className="px-4 py-3 text-left align-top text-[10px] text-gray-700 font-medium">{formatRequirementList(course.prereq)}</td>
                <td className="px-4 py-3 text-left align-top text-[10px] text-gray-700 font-medium">{formatRequirementList(course.coreq)}</td>
                {showInstructors && (
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-center">
                      {course.instructors?.length > 0 ? (
                        course.instructors.map((inst) => (
                          <span
                            key={inst.id}
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]"
                            title={inst.full_name}
                          >
                            {inst.full_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Unassigned</span>
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
            <tr className="bg-gray-50/50 border-t border-gray-100 font-bold text-gray-900">
              <td colSpan={showInstructors ? 2 : 2} className="px-4 py-3 text-right uppercase tracking-wider text-gray-500 text-[10px]">
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
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
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
            <h4 className="text-xs font-black uppercase tracking-widest text-[#800000] bg-red-50/50 border-l-4 border-[#800000] pl-3 py-1.5 rounded-r-lg">
              {year}
            </h4>
            <div className="grid grid-cols-1 gap-6">
              {sortedSemestersList.map((semester) => (
                <SemesterTable
                  key={semester}
                  semesterName={semester}
                  semesterLabel={semester}
                  yearLabel={year}
                  coursesList={yearSemesters[semester]}
                  showInstructors={showInstructors}
                  onAssignInstructor={onAssignInstructor}
                />
              ))}
            </div>
          </div>
        );
      })}
      {/* Free Electives Section */}
      <div className="space-y-4 mt-8">
        <h4 className="text-xs font-black uppercase tracking-widest text-[#800000] bg-red-50/50 border-l-4 border-[#800000] pl-3 py-1.5 rounded-r-lg">
          Free Electives
        </h4>
        <SemesterTable
          semesterName="Free Electives"
          semesterLabel="Free Electives"
          yearLabel=""
          coursesList={courses.filter((c) => /^ELECTIVE/i.test(c.code))}
          showInstructors={showInstructors}
          onAssignInstructor={onAssignInstructor}
        />
      </div>
    </div>
  );
}
export default DynamicCurriculumView;

import React from "react";

export function SyllabusDynamicView({ detailedSyllabus }) {
  if (!detailedSyllabus) return null;

  return (
    <div className="bg-white p-8 space-y-8" id="syllabus-dynamic-view-container" style={{ width: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Info Header */}
      <div className="border-b border-[#f3f4f6] pb-6 flex justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#991b1b] uppercase tracking-widest bg-[#fef2f2] px-2 py-0.5 rounded-md">Course Info</span>
          <h4 className="text-xl font-black text-[#111827] mt-2">{detailedSyllabus.code} - {detailedSyllabus.title}</h4>
          <span className="text-sm font-medium text-[#6b7280] mt-1 block">Units: <strong>{detailedSyllabus.units} Units</strong></span>
        </div>
        <div className="text-right text-xs">
          <span className="text-[#9ca3af] block uppercase font-bold">Instructor In-Charge</span>
          <span className="text-[#374151] block font-extrabold mt-1">{detailedSyllabus.instructor_name || "Unassigned"}</span>
          <span className="text-[#9ca3af] block font-semibold mt-0.5">{detailedSyllabus.instructor_email || "N/A"}</span>
        </div>
      </div>

      {/* 1. Performance Indicators (PI) / CLOs */}
      <div className="space-y-3">
        <h5 className="text-sm font-black uppercase tracking-wider text-[#1f2937] border-l-4 border-[#800000] pl-3">
          1. Course Learning Outcomes
        </h5>
        {(detailedSyllabus.course_outcomes?.length > 0 || detailedSyllabus.learning_outcomes?.length > 0) ? (
          <ol className="divide-y divide-[#f3f4f6] text-sm text-[#4b5563] bg-[#fafafa] rounded-xl border border-[#f3f4f6] overflow-hidden">
            {(detailedSyllabus.course_outcomes?.length > 0 ? detailedSyllabus.course_outcomes : detailedSyllabus.learning_outcomes).map((item, i) => (
              <li key={i} className="px-5 py-3 flex gap-3 leading-relaxed">
                <span className="font-bold text-[#800000]">{i + 1}.</span>
                <span>{item.description}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[#9ca3af] italic pl-3">No outcomes specified.</p>
        )}
      </div>

      {/* 2. OBTL Weekly Instructional Calendar */}
      <div className="space-y-3">
        <h5 className="text-sm font-black uppercase tracking-wider text-[#1f2937] border-l-4 border-[#800000] pl-3">
          2. Weekly Teaching Schedule
        </h5>
        {detailedSyllabus.weekly_plans?.length > 0 ? (
          <div className="overflow-x-auto border border-[#f3f4f6] rounded-xl overflow-hidden  bg-white">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6] font-bold text-[#6b7280]">
                  <th className="px-4 py-3 w-16">Week</th>
                  <th className="px-4 py-3">Topic / Subject Matter</th>
                  <th className="px-4 py-3">Activities</th>
                  <th className="px-4 py-3">Assessments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6] text-[#4b5563]">
                {detailedSyllabus.weekly_plans.map((p, i) => (
                  <tr key={i} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 font-bold text-[#800000] text-center bg-[#fef2f2]">W{p.week}</td>
                    <td className="px-4 py-3 font-semibold text-[#111827]">{p.topic}</td>
                    <td className="px-4 py-3">{p.activities || "—"}</td>
                    <td className="px-4 py-3">{p.assessments || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#9ca3af] italic pl-3">No schedule specified.</p>
        )}
      </div>

      {/* 3. Grading Components */}
      <div className="space-y-3">
        <h5 className="text-sm font-black uppercase tracking-wider text-[#1f2937] border-l-4 border-[#800000] pl-3">
          3. Classroom Grading Criteria
        </h5>
        {detailedSyllabus.grading_components?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-[#f3f4f6] rounded-xl overflow-hidden bg-[#fafafa]">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-[#f9fafb] border-b border-[#f3f4f6] font-bold text-[#6b7280]">
                    <th className="px-5 py-3">Grading Component</th>
                    <th className="px-5 py-3 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6] text-[#4b5563]">
                  {detailedSyllabus.grading_components.map((g, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3 font-semibold">{g.name}</td>
                      <td className="px-5 py-3 text-right font-extrabold text-[#800000]">{g.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-[#fef2f2] font-bold text-[#111827] border-t border-[#e5e7eb]">
                    <td className="px-5 py-3">Total Weight</td>
                    <td className="px-5 py-3 text-right text-base font-black text-[#7f1d1d]">
                      {detailedSyllabus.grading_components.reduce((sum, curr) => sum + curr.percentage, 0)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="rounded-xl border border-dashed border-[#e5e7eb] p-5 flex flex-col justify-center bg-[#ffffff]">
              <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">PUP Grading Standard</span>
              <p className="text-xs text-[#6b7280] mt-2 leading-relaxed">
                The minimum passing grade for undergraduate subjects is 75% or 3.0. Final assessments are computed strictly using the components described in the syllabus.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#9ca3af] italic pl-3">No grading components specified.</p>
        )}
      </div>
    </div>
  );
}

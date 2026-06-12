"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react";

export default function InstructorCurriculumPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCurricula, setCustomCurricula] = useState({});
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [departments, setDepartments] = useState([]);
  const selectedDepartmentObject = departments.find(d => d.id === selectedDept);

  const fetchMetadata = async () => {
    try {
      const userRes = await fetch("/api/user");
      const userData = await userRes.json();
      if (userData.user) {
        setUserProfile(userData.user);
      }
      
      const deptRes = await fetch("/api/programs");
      const deptData = await deptRes.json();
      const depts = deptData.programs || [];
      setDepartments(depts);

      const currRes = await fetch("/api/curriculum");
      const currData = await currRes.json();
      const curriculaMap = {};
      currData.curricula?.forEach(c => {
        curriculaMap[c.program_id] = c;
      });
      setCustomCurricula(curriculaMap);

      const coursesRes = await fetch("/api/courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);

      const bsitDept = depts.find(d => d.name.includes("Information Technology"));
      const defaultDept = userData.user?.program_id || bsitDept?.id || depts[0]?.id;
      if (defaultDept) {
        setSelectedDept(defaultDept);
      }
    } catch (error) {
      console.error("Failed to load curriculum:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Loading your assigned courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Assigned Courses</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Dynamic Catalog · Use as reference when creating syllabi</p>
          </div>
        </div>
        {/* Program Selector for instructors */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Program:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name.match(/\(([^)]+)\)/)?.[1] || dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {customCurricula[selectedDept] ? (
        (() => {
          const sheet = customCurricula[selectedDept];
          const programCourses = courses.filter(c => c.program_id === selectedDept);

          const grouped = {};
          programCourses.forEach(course => {
            const y = course.year_level || "UNASSIGNED";
            const s = course.semester || "Unassigned Semester";
            if (!grouped[y]) grouped[y] = {};
            if (!grouped[y][s]) grouped[y][s] = [];
            grouped[y][s].push(course);
          });

          const yearOrder = { "FIRST YEAR": 1, "SECOND YEAR": 2, "THIRD YEAR": 3, "FOURTH YEAR": 4 };
          const semesterOrder = { "1st Semester": 1, "2nd Semester": 2, "Summer Term": 3 };

          const sortedYears = Object.keys(grouped).sort((a, b) => {
            return (yearOrder[a] || 99) - (yearOrder[b] || 99);
          });

          const renderSemesterTable = (semesterName, coursesList) => {
            const totalUnits = coursesList.reduce((sum, c) => sum + (c.units || 0), 0);

            return (
              <div className="bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full rounded-2xl">
                <div className="bg-[#800000]/5 border-b border-gray-100 px-4 py-3">
                  <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">{semesterName}</h5>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                        <th className="px-4 py-3 w-24">Course Code</th>
                        <th className="px-4 py-3">Course Title</th>
                        <th className="px-4 py-3 text-center w-20">Units</th>
                        <th className="px-4 py-3 text-center w-28">Pre-Requisites</th>
                        <th className="px-4 py-3 text-center w-28">Co-Requisites</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {coursesList.map((course, idx) => (
                        <tr key={course.id || idx} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900">{course.code}</td>
                          <td className="px-4 py-3 text-gray-700 leading-tight">{course.title}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-950">{course.units}</td>
                          <td className="px-4 py-3 text-center text-[10px] text-gray-400 font-semibold italic">{course.prereq || "—"}</td>
                          <td className="px-4 py-3 text-center text-[10px] text-gray-400 font-semibold italic">{course.coreq || "—"}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50/50 border-t border-gray-100 font-bold text-gray-900">
                        <td colSpan={2} className="px-4 py-3 text-right uppercase tracking-wider text-gray-500 text-[10px]">Semester Totals:</td>
                        <td className="px-4 py-3 text-center font-extrabold text-[#800000]">{totalUnits}</td>
                        <td colSpan={2} className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          };

          return (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#800000] uppercase tracking-widest block">
                    {selectedDepartmentObject?.name}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#800000]" />
                    <span>Your Assigned Courses</span>
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Curriculum active since {formatDate(sheet.uploaded_at)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {programCourses.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <span className="text-xs font-semibold">No courses are available for this program yet.</span>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {sortedYears.map(year => {
                      const yearSemesters = grouped[year];
                      const sortedSemesters = Object.keys(yearSemesters).sort((a, b) => {
                        return (semesterOrder[a] || 99) - (semesterOrder[b] || 99);
                      });

                      return (
                        <div key={year} className="space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-[#800000] bg-red-50/50 border-l-4 border-[#800000] pl-3 py-1.5 rounded-r-lg">
                            {year}
                          </h4>
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {sortedSemesters.map(sem => (
                              <div key={sem}>
                                {renderSemesterTable(`${year} – ${sem}`, yearSemesters[sem])}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-8 text-center space-y-6 max-w-xl mx-auto py-12">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-gray-900 leading-tight">Curriculum Not Available</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              No curriculum document has been uploaded for your assigned program yet.
            </p>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 leading-relaxed max-w-sm mx-auto">
            Please contact your Department Chairperson or academic head regarding the curriculum upload.
          </div>
        </div>
      )}
    </div>
  );
}

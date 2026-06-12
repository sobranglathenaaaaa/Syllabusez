"use client";

import { useState, useEffect } from "react";
import DynamicCurriculumView from "@/components/curriculum/DynamicCurriculumView";
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
      const userRes = await fetch("/api/user", { cache: "no-store" });
      const userData = await userRes.json();
      if (userData.user) {
        setUserProfile(userData.user);
      }

      const deptRes = await fetch("/api/programs", { cache: "no-store" });
      const deptData = await deptRes.json();
      const depts = deptData.programs || [];
      setDepartments(depts);

      const currRes = await fetch("/api/curriculum", { cache: "no-store" });
      const currData = await currRes.json();
      const curriculaMap = {};
      currData.curricula?.forEach(c => {
        curriculaMap[c.program_id] = c;
      });
      setCustomCurricula(curriculaMap);

      const coursesRes = await fetch("/api/courses", { cache: "no-store" });
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

  const programCourses = courses.filter(
    (course) => course.program_id === selectedDept
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Program Curriculum</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Dynamic Curriculum · Complete Program Reference</p>
          </div>
        </div>
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

          return (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#800000] uppercase tracking-widest block">
                    {selectedDepartmentObject?.name}
                  </span>
                  <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#800000]" />
                    <span>Program Curriculum</span>
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Curriculum active since {formatDate(sheet.uploaded_at)}</span>
                  </p>
                </div>
              </div>

              <DynamicCurriculumView
                courses={programCourses}
                emptyMessage="No structured courses found in this curriculum."
              />
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
              No structured curriculum has been published for your assigned program yet.
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

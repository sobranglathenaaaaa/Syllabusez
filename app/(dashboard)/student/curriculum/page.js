"use client";

import { useState, useEffect } from "react";
import DynamicCurriculumView from "@/components/curriculum/DynamicCurriculumView";
import {
  BookOpen,
  AlertTriangle
} from "lucide-react";
import DownloadCurriculumButton from "@/components/curriculum/DownloadCurriculumButton";

export default function CurriculumPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customCurricula, setCustomCurricula] = useState({});
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

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

      const programId = userData.user?.program_id;
      const coursesRes = await fetch(`/api/courses${programId ? `?program_id=${encodeURIComponent(programId)}` : ""}`, { cache: "no-store" });
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);

      const enrollRes = await fetch("/api/enrollments/me", { cache: "no-store" });
      const enrollData = await enrollRes.json();
      setEnrolledCourseIds(enrollData.courseIds || []);

      const bsitDept = depts.find(d => d.name.includes("Information Technology"));
      const defaultDept = userData.user?.program_id || bsitDept?.id || depts[0]?.id;
      if (defaultDept) {
        setSelectedDept(defaultDept);
      }
    } catch (error) {
      console.error("Failed to load student curriculum sheet:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Initializing Curriculum workspace...</span>
      </div>
    );
  }

  const programCourses = courses.filter(c => c.program_id === selectedDept);
  const hasPublishedCurriculum = Boolean(customCurricula[selectedDept]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Program Curriculum</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Dynamic Curriculum · Your Complete Program Guide</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          <DownloadCurriculumButton
            programName={selectedDept ? departments.find(d => d.id === selectedDept)?.name : ""}
            programId={selectedDept}
            fileName={customCurricula[selectedDept]?.file_name}
            courses={programCourses}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Program:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              disabled={true}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white"
            >
              {(userProfile?.program_id ? departments.filter(d => d.id === userProfile.program_id) : departments.filter(d => d.id === selectedDept)).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name.match(/\(([^)]+)\)/)?.[1] || dept.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] text-gray-500 italic">Viewing assigned program only.</span>
        </div>
      </div>

      {!hasPublishedCurriculum ? (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-8 text-center space-y-6 max-w-xl mx-auto py-12">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-gray-900 leading-tight">Curriculum Not Available</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              No structured curriculum has been published for your program yet.
            </p>
          </div>
        </div>
      ) : programCourses.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 border-dashed">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <span className="text-xs font-semibold">No structured courses found in this curriculum.</span>
        </div>
      ) : (
        <div className="print-curriculum-container">
          <DynamicCurriculumView
            courses={programCourses}
            emptyMessage="No structured courses found in this curriculum."
          />
        </div>
      )}
    </div>
  );
}

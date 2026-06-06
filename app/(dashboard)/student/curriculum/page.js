"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Printer,
  Download,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from "lucide-react";

export default function CurriculumPage() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  // Use static curriculum file for student view
  const staticCurriculumUrl = "/uploads/updated_curriculum.pdf";
  const fileUrl = staticCurriculumUrl;
  const ext = staticCurriculumUrl.split('.').pop().toLowerCase();
  const [customCurricula, setCustomCurricula] = useState({});

  // Dynamic TXT reading state
  const [textContents, setTextContents] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  const fetchMetadata = async () => {
    try {
      // 1. Fetch all academic programs
      const deptRes = await fetch("/api/programs");
      const deptData = await deptRes.json();
      const depts = deptData.programs || [];
      setDepartments(depts);

      // Default selected department to Bachelor of Science in Information Technology (BSIT)
      const bsitDept = depts.find(d => d.name.includes("Information Technology"));
      if (bsitDept) {
        setSelectedDept(bsitDept.id);
      } else if (depts.length > 0) {
        setSelectedDept(depts[0].id);
      }

      // 2. Fetch all custom uploaded curricula files
      const currRes = await fetch("/api/curriculum");
      const currData = await currRes.json();
      const curriculaMap = {};
      currData.curricula?.forEach(c => {
        curriculaMap[c.program_id] = c;
      });
      setCustomCurricula(curriculaMap);
    } catch (error) {
      console.error("Failed to load student curriculum sheet:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const selectedDepartmentObject = departments.find(d => d.id === selectedDept);
  const activeCustomCurriculum = customCurricula[selectedDept];
  const isBSITSelected = selectedDepartmentObject?.name?.includes("Information Technology");
  const staticExt = staticCurriculumUrl.split('.').pop().toLowerCase();

  // Dynamic text reader for custom TXT curriculum files
  useEffect(() => {
    if (activeCustomCurriculum) {
      const ext = activeCustomCurriculum.file_name.split('.').pop().toLowerCase();
      if (ext === "txt") {
        setLoadingText(true);
        setTextContents("");
        const fileUrl = getCustomUrl(selectedDept, activeCustomCurriculum.file_name);
        fetch(fileUrl)
          .then(res => res.text())
          .then(text => {
            setTextContents(text);
            setLoadingText(false);
          })
          .catch(err => {
            console.error(err);
            setTextContents("Failed to parse text document contents.");
            setLoadingText(false);
          });
      }
    }
  }, [selectedDept, activeCustomCurriculum]);

  const handlePrint = () => {
    window.print();
  };

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getCustomUrl(deptId, fileName) {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    return `/uploads/curricula/${deptId}_${safeFileName}`;
  }

  // Static BSIT Curriculum Data
  const firstYear1stSem = [
    { code: "GEED 032", title: "Filipinolohiya at Pambansang Kaunlaran", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "GEED 005", title: "Purposive Communication", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "GEED 004", title: "Mathematics in the Modern World", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "ACCO 014", title: "Principles of Accounting", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 001", title: "Introduction to Computing", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "COMP 002", title: "Computer Programming 1", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "PATHFit 1", title: "Physical Activities Towards Health and Fitness 1 - Movement Competency Training", lec: 2, lab: 0, units: 2, prereq: "None" },
    { code: "NSTP 001", title: "National Service Training Program 1", lec: 3, lab: 0, units: 3, prereq: "None" }
  ];

  const firstYear2ndSem = [
    { code: "GEED 033", title: "Pagsasalin sa Kontekstong Filipino", lec: 3, lab: 0, units: 3, prereq: "GEED 032" },
    { code: "GEED 002", title: "Readings in Philippine History", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "GEED 020", title: "Politics Governance and Citizenship", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 004", title: "Discrete Structures 1", lec: 3, lab: 0, units: 3, prereq: "GEED 004" },
    { code: "COMP 003", title: "Computer Programming 2", lec: 2, lab: 3, units: 3, prereq: "COMP 002" },
    { code: "GEED 010", title: "People and the Earth’s Ecosystem", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "PATHFit 2", title: "Physical Activities Towards Health and Fitness 2 - Exercise-Based Fitness Activities", lec: 2, lab: 0, units: 2, prereq: "PATHFit 1" },
    { code: "NSTP 002", title: "National Service Training Program 2", lec: 3, lab: 0, units: 3, prereq: "NSTP 001" }
  ];

  const secondYear1stSem = [
    { code: "GEED 001", title: "Understanding the Self", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "GEED 028", title: "Reading Visual Arts", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "INTE-FE 1", title: "BSIT Free Elective 1", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 007", title: "Operating Systems", lec: 2, lab: 3, units: 3, prereq: "COMP 001" },
    { code: "INTE 201", title: "Programming 3 (Structured Programming)", lec: 2, lab: 3, units: 3, prereq: "COMP 003" },
    { code: "COMP 008", title: "Data Communications and Networking", lec: 2, lab: 3, units: 3, prereq: "COMP 001" },
    { code: "COMP 006", title: "Data Structures and Algorithms", lec: 2, lab: 3, units: 3, prereq: "COMP 003" },
    { code: "PATHFit 3", title: "Physical Activities Towards Health and Fitness 3 - Choice of Sports/Recreational Activities", lec: 2, lab: 0, units: 2, prereq: "PATHFit 2" }
  ];

  const secondYear2ndSem = [
    { code: "INTE-FE 2", title: "BSIT Free Elective 2", lec: 3, lab: 0, units: 3, prereq: "INTE-FE 1" },
    { code: "COMP 012", title: "Network Administration", lec: 2, lab: 3, units: 3, prereq: "COMP 008" },
    { code: "COMP 013", title: "Human Computer Interaction", lec: 2, lab: 3, units: 3, prereq: "COMP 001" },
    { code: "COMP 014", title: "Quantitative Methods with Modeling and Simulation", lec: 3, lab: 0, units: 3, prereq: "GEED 004" },
    { code: "INTE 202", title: "Integrative Programming and Technologies 1", lec: 2, lab: 3, units: 3, prereq: "INTE 201" },
    { code: "COMP 009", title: "Object Oriented Programming", lec: 2, lab: 3, units: 3, prereq: "COMP 006" },
    { code: "COMP 010", title: "Information Management", lec: 2, lab: 3, units: 3, prereq: "COMP 006" },
    { code: "PATHFit 4", title: "Physical Activities Towards Health and Fitness 4 - Advanced Sports/Recreational Activities", lec: 2, lab: 0, units: 2, prereq: "PATHFit 3" }
  ];

  const thirdYear1stSem = [
    { code: "GEED 006", title: "Art Appreciation", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 016", title: "Web Development", lec: 2, lab: 3, units: 3, prereq: "COMP 010" },
    { code: "INTE 301", title: "Systems Integration and Architecture 1", lec: 2, lab: 3, units: 3, prereq: "INTE 202" },
    { code: "COMP 017", title: "Multimedia", lec: 2, lab: 3, units: 3, prereq: "COMP 013" },
    { code: "INTE-E1", title: "IT ELECTIVE 1", lec: 2, lab: 3, units: 3, prereq: "COMP 009" },
    { code: "COMP 018", title: "Database Administration", lec: 2, lab: 3, units: 3, prereq: "COMP 010" },
    { code: "COMP 015", title: "Fundamentals of Research", lec: 3, lab: 0, units: 3, prereq: "COMP 014" }
  ];

  const thirdYear2ndSem = [
    { code: "GEED 003", title: "The Contemporary World", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "HRMA 001", title: "Principles of Management and Organization", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "INTE 302", title: "Information Assurance and Security 1", lec: 2, lab: 3, units: 3, prereq: "COMP 012" },
    { code: "GEED 008", title: "Ethics", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "INTE 303", title: "Capstone Project 1", lec: 3, lab: 0, units: 3, prereq: "COMP 015" },
    { code: "INTE-E2", title: "IT ELECTIVE 2", lec: 2, lab: 3, units: 3, prereq: "INTE-E1" },
    { code: "COMP 019", title: "Applications Development and Emerging Technologies", lec: 2, lab: 3, units: 3, prereq: "COMP 010" }
  ];

  const thirdYearSummer = [
    { code: "GEED 037", title: "Buhay at Mga Sinulat ni Rizal", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "INTE-E3", title: "IT Elective 3", lec: 2, lab: 3, units: 3, prereq: "INTE-E2" }
  ];

  const fourthYear1stSem = [
    { code: "GEED 007", title: "Science, Technology and Society", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 023", title: "Social and Professional Issues in Computing", lec: 3, lab: 0, units: 3, prereq: "COMP 001" },
    { code: "INTE 401", title: "Information Assurance and Security 2", lec: 2, lab: 3, units: 3, prereq: "INTE 302" },
    { code: "INTE 402", title: "Capstone Project 2", lec: 3, lab: 0, units: 3, prereq: "INTE 303" },
    { code: "INTE 403", title: "Systems Administration and Maintenance", lec: 2, lab: 3, units: 3, prereq: "COMP 012" },
    { code: "INTE-E4", title: "IT Elective 4", lec: 2, lab: 3, units: 3, prereq: "INTE-E3" }
  ];

  const fourthYear2ndSem = [
    { code: "INTE 404", title: "Practicum (500 HOURS)", lec: 0, lab: 12, units: 12, prereq: "All previous course completions" },
    { code: "COMP 024", title: "Technopreneurship", lec: 3, lab: 0, units: 3, prereq: "HRMA 001, INTE 402" }
  ];

  const freeElectiveOptions = [
    { code: "OFAD 012", title: "Personal and Professional Development", lec: 3, lab: 0, units: 3 },
    { code: "JAPA 101", title: "Japanese 1", lec: 3, lab: 0, units: 3 },
    { code: "SPAN 101", title: "Spanish 1", lec: 3, lab: 0, units: 3 },
    { code: "COMP 011", title: "Technical Documentation and Presentation Skills in ICT", lec: 3, lab: 0, units: 3 },
    { code: "COMP 047", title: "E-Commerce", lec: 3, lab: 0, units: 3 },
    { code: "MATH 018", title: "Linear Algebra with Simulation Software", lec: 3, lab: 0, units: 3 },
    { code: "STAT 013", title: "Inferential Statistics", lec: 3, lab: 0, units: 3 }
  ];

  const regularElectiveOptions = [
    { code: "INTE 351", title: "Systems Analysis and Design", lec: 2, lab: 3, units: 3 },
    { code: "INTE 352", title: "Systems Testing and Automation", lec: 2, lab: 3, units: 3 },
    { code: "INTE 361", title: "Advanced Computing Techniques", lec: 2, lab: 3, units: 3 },
    { code: "INTE 362", title: "Quality Assurance", lec: 2, lab: 3, units: 3 },
    { code: "INTE 371", title: "Web Systems and Technologies", lec: 2, lab: 3, units: 3 },
    { code: "INTE 372", title: "IT Audit and Controls", lec: 2, lab: 3, units: 3 },
    { code: "INTE 481", title: "Event Driven Programming", lec: 2, lab: 3, units: 3 },
    { code: "INTE 482", title: ".NET Fundamentals", lec: 2, lab: 3, units: 3 }
  ];

  const commonElectiveOptions = [
    { code: "COMP 025", title: "Project Management", lec: 3, lab: 0, units: 3 },
    { code: "COMP 026", title: "Principles of Systems Thinking", lec: 3, lab: 0, units: 3 },
    { code: "COMP 030", title: "Business Intelligence", lec: 3, lab: 0, units: 3 },
    { code: "COMP 031", title: "Router Configuration", lec: 2, lab: 3, units: 3 },
    { code: "COMP 034", title: "Introduction to Data Science", lec: 2, lab: 3, units: 3 },
    { code: "COMP 038", title: "Cybersecurity Fundamentals", lec: 2, lab: 3, units: 3 },
    { code: "COMP 042", title: "Platform Technologies", lec: 2, lab: 3, units: 3 },
    { code: "COMP 027", title: "Mobile Applications Development", lec: 2, lab: 3, units: 3 },
    { code: "COMP 032", title: "Switching and Wireless Network Configuration", lec: 2, lab: 3, units: 3 },
    { code: "COMP 035", title: "Data Mining", lec: 2, lab: 3, units: 3 },
    { code: "COMP 039", title: "End-Point Security", lec: 2, lab: 3, units: 3 },
    { code: "COMP 043", title: "Distributed Systems", lec: 2, lab: 3, units: 3 },
    { code: "COMP 046", title: "Data Warehousing", lec: 2, lab: 3, units: 3 },
    { code: "COMP 028", title: "Principles of Game Design", lec: 3, lab: 0, units: 3 },
    { code: "COMP 033", title: "Wide Area Networks", lec: 2, lab: 3, units: 3 },
    { code: "COMP 036", title: "R Programming", lec: 2, lab: 3, units: 3 },
    { code: "COMP 040", title: "Network and Enterprise Protection", lec: 2, lab: 3, units: 3 },
    { code: "COMP 044", title: "Parallel Architecture", lec: 2, lab: 3, units: 3 },
    { code: "COMP 045", title: "Mobile Computing", lec: 2, lab: 3, units: 3 },
    { code: "COMP 037", title: "Machine Learning", lec: 2, lab: 3, units: 3 },
    { code: "COMP 029", title: "Animation and Game Programming", lec: 2, lab: 3, units: 3 },
    { code: "COMP 041", title: "Cloud and Virtualization Security", lec: 2, lab: 3, units: 3 }
  ];

  const renderSemesterTable = (semesterName, coursesList) => {
    const totalLec = coursesList.reduce((sum, c) => sum + c.lec, 0);
    const totalLab = coursesList.reduce((sum, c) => sum + c.lab, 0);
    const totalUnits = coursesList.reduce((sum, c) => sum + c.units, 0);

    return (
      <div className="bg-white border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full rounded-2xl print:border-black print:shadow-none">
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5 print:bg-transparent print:border-black">
          <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider print:text-black">{semesterName}</h5>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs text-left border-collapse print:text-[10px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300 text-[10px] font-bold text-gray-600 uppercase print:bg-transparent print:border-black">
                <th className="px-3 py-2 border-r border-gray-300 w-18 print:border-black">Course Code</th>
                <th className="px-3 py-2 border-r border-gray-300 print:border-black">Course Title</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center w-14 print:border-black">Lec Hours</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center w-14 print:border-black">Lab Hours</th>
                <th className="px-2 py-2 border-r border-gray-300 text-center w-14 print:border-black">Credit Units</th>
                <th className="px-3 py-2 text-center w-20">Pre-Reqs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 print:divide-black">
              {coursesList.map((course, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 print:hover:bg-transparent">
                  <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 print:border-black print:text-black">{course.code}</td>
                  <td className="px-3 py-2 border-r border-gray-300 print:border-black leading-tight text-gray-700 print:text-black">{course.title}</td>
                  <td className="px-2 py-2 border-r border-gray-300 text-center text-gray-800 print:border-black print:text-black">{course.lec}</td>
                  <td className="px-2 py-2 border-r border-gray-300 text-center text-gray-800 print:border-black print:text-black">{course.lab}</td>
                  <td className="px-2 py-2 border-r border-gray-300 text-center font-bold text-gray-950 print:border-black print:text-black">{course.units}</td>
                  <td className="px-3 py-2 text-center text-[10px] text-gray-400 font-semibold print:text-black italic">{course.prereq || "—"}</td>
                </tr>
              ))}
              <tr className="bg-gray-50/70 border-t-2 border-gray-300 font-bold text-gray-900 print:bg-transparent print:border-black">
                <td colSpan={2} className="px-3 py-2 text-right border-r border-gray-300 uppercase tracking-wider print:border-black print:text-black">Semester Totals:</td>
                <td className="px-2 py-2 border-r border-gray-300 text-center print:border-black print:text-black">{totalLec}</td>
                <td className="px-2 py-2 border-r border-gray-300 text-center print:border-black print:text-black">{totalLab}</td>
                <td className="px-2 py-2 border-r border-gray-300 text-center font-extrabold text-[#800000] print:border-black print:text-black">{totalUnits}</td>
                <td className="px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Initializing Curriculum workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Dynamic Header & Switcher */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Academic Curriculum Sheet</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Official Program Directories</p>
          </div>
        </div>

        {/* Dynamic Selector */}
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

          {!activeCustomCurriculum && isBSITSelected && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-800/10 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* --- SCENARIO A: Active Custom Curriculum Uploaded (WITH IMMEDIATE EMBEDDED VIEWER) --- */}
      {activeCustomCurriculum ? (
        <div className="space-y-6">

          {/* Top Interactive Download Bar */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 leading-tight">Official Curriculum Document</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[10px] font-semibold text-gray-400">
                  <span className="text-[#800000] font-bold">{selectedDepartmentObject?.name}</span>
                  <span>•</span>
                  <span className="text-gray-500 font-bold">{activeCustomCurriculum.file_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Uploaded {formatDate(activeCustomCurriculum.uploaded_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Download */}
            <a
              href={fileUrl}
              download
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Curriculum</span>
            </a>
          </div>

          {/* --- CORE EMBEDDED VIEWER PANEL ("Kita Agad yung New Thing") --- */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col">
            <div className="px-6 py-3.5 bg-gray-50/50 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-800">
              <span className="uppercase tracking-widest text-[10px] text-[#800000]">Document Viewer</span>
              <span>Active Sheet Preview</span>
            </div>

            <div className="p-4 bg-gray-50 flex flex-col justify-center min-h-[500px]">
              {(() => {
                if (ext === "pdf") {
                  return (
                    <iframe
                      src={fileUrl}
                      className="w-full h-[750px] rounded-2xl border border-gray-200 bg-white shadow-sm"
                      title="Student Curriculum Viewer"
                    />
                  );
                }

                if (ext === "txt") {
                  return (
                    <div className="w-full min-h-[600px] bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
                      {loadingText ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-500 font-semibold">Parsing document contents...</span>
                        </div>
                      ) : (
                        <pre className="flex-1 p-6 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono whitespace-pre-wrap overflow-y-auto text-gray-800 text-left leading-relaxed">
                          {textContents}
                        </pre>
                      )}
                    </div>
                  );
                }

                // Word document viewer embed
                const googleViewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + fileUrl)}&embedded=true`;
                return (
                  <div className="w-full h-[650px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3 bg-amber-50 border-b border-amber-100 text-center text-[10px] font-bold text-amber-800 flex items-center justify-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Office document viewer active. Scroll to review the curriculum structure.</span>
                    </div>
                    <iframe
                      src={googleViewUrl}
                      className="flex-1 w-full border-none"
                      title="Office Document Preview"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Bottom auxiliary print bar */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
              <span>Official Branch Registry Sheet</span>
              <a
                href={fileUrl}
                download
                className="font-extrabold text-green-600 hover:text-green-800 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Curriculum File ({ext.toUpperCase()})</span>
              </a>
            </div>
          </div>

        </div>
      ) : isBSITSelected ? (

        // --- SCENARIO B: fallback to high-fidelity BSIT dynamic grid if no custom upload exists ---
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 lg:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">

          <div className="text-center border-b border-gray-300 pb-6 space-y-2 print:pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#800000] block print:text-black">Curriculum Catalog</span>
            <h2 className="text-sm font-bold text-gray-800 print:text-black">2022 Approved Revised Curriculum</h2>
            <span className="text-[10px] font-bold text-gray-400 block tracking-wide uppercase print:text-black">
              BOR Resolution No 2825; 30-September 2022
            </span>
            <div className="text-gray-500 font-semibold text-[10px] uppercase leading-relaxed print:text-black">
              <p>Republic of the Philippines</p>
              <p className="font-extrabold text-gray-700">Polytechnic University of the Philippines</p>
              <p>Office of the Vice President for Academic Affairs</p>
              <p className="tracking-widest">Quality Assurance Center</p>
            </div>
            <h3 className="text-base font-black text-gray-900 border-t border-b border-gray-300 py-2.5 my-2 uppercase tracking-wide print:text-black">
              Bachelor of Science in Information Technology (BSIT) 2022 - 2023
            </h3>
          </div>

          {/* First Year */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              First Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("FIRST YEAR – 1st Semester", firstYear1stSem)}
              {renderSemesterTable("FIRST YEAR – 2nd Semester", firstYear2ndSem)}
            </div>
          </div>

          {/* Second Year */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Second Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("SECOND YEAR – 1st Semester", secondYear1stSem)}
              {renderSemesterTable("SECOND YEAR – 2nd Semester", secondYear2ndSem)}
            </div>
          </div>

          {/* Third Year */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Third Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("THIRD YEAR – 1st Semester", thirdYear1stSem)}
              {renderSemesterTable("THIRD YEAR – 2nd Semester", thirdYear2ndSem)}
            </div>

            {/* Summer Term */}
            <div className="max-w-xl">
              {renderSemesterTable("THIRD YEAR – Summer Term", thirdYearSummer)}
            </div>
          </div>

          {/* Fourth Year */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Fourth Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("FOURTH YEAR – 1st Semester", fourthYear1stSem)}
              {renderSemesterTable("FOURTH YEAR – 2nd Semester", fourthYear2ndSem)}
            </div>
          </div>

          {/* Electives directory */}
          <div className="space-y-8 pt-4 border-t border-gray-300">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Elective Course Libraries
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5">
                  <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">OPTIONS FOR FREE ELECTIVES</h5>
                </div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300 text-[10px] font-bold text-gray-600 uppercase">
                      <th className="px-3 py-2 border-r border-gray-300 w-20">Code</th>
                      <th className="px-3 py-2 border-r border-gray-300">Title</th>
                      <th className="px-3 py-2 text-center w-14">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {freeElectiveOptions.map((e, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">{e.code}</td>
                        <td className="px-3 py-2 border-r border-gray-300 text-gray-700 leading-tight">{e.title}</td>
                        <td className="px-3 py-2 text-center font-bold text-gray-900">{e.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5">
                  <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">OPTIONS FOR BSIT SPECIALIZATION ELECTIVES</h5>
                </div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300 text-[10px] font-bold text-gray-600 uppercase">
                      <th className="px-3 py-2 border-r border-gray-300 w-20">Code</th>
                      <th className="px-3 py-2 border-r border-gray-300">Title</th>
                      <th className="px-3 py-2 text-center w-14">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {regularElectiveOptions.map((e, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">{e.code}</td>
                        <td className="px-3 py-2 border-r border-gray-300 text-gray-700 leading-tight">{e.title}</td>
                        <td className="px-3 py-2 text-center font-bold text-gray-900">{e.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border border-gray-300 rounded-2xl overflow-hidden shadow-sm bg-white">
              <div className="bg-gray-100 border-b border-gray-300 px-4 py-2.5">
                <h5 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">OTHER ELECTIVE COURSES (Common to BSIT and BSCS Programs)</h5>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-300 text-[10px] font-bold text-gray-600 uppercase">
                      <th className="px-3 py-2 border-r border-gray-300 w-24">Course Code</th>
                      <th className="px-3 py-2 border-r border-gray-300">Course Title</th>
                      <th className="px-3 py-2 text-center w-14">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {commonElectiveOptions.map((e, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/30">
                        <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">{e.code}</td>
                        <td className="px-3 py-2 border-r border-gray-300 text-gray-700 leading-tight">{e.title}</td>
                        <td className="px-3 py-2 text-center font-bold text-gray-900">{e.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 text-[10px] text-gray-400 font-semibold flex flex-col sm:flex-row justify-between items-center gap-2 print:pt-4">
            <span>Official Syllabus Registry & Academic Portal • PUP San Juan Branch</span>
            <span>Approved: Academic Year 2022 - 2023 • Page 1 of 1</span>
          </div>
        </div>
      ) : (

        // --- SCENARIO C: placeholder fallback for other 7 programs with no custom upload ---
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-8 text-center space-y-6 max-w-xl mx-auto py-12">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-black text-gray-900 leading-tight">Curriculum Pending Upload</h4>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              No official customized curriculum document has been uploaded by the administration for this program yet:
            </p>
            <span className="inline-block mt-2 px-3 py-1.5 bg-amber-50 text-amber-800 font-black text-xs rounded-xl border border-amber-100">
              {selectedDepartmentObject?.name}
            </span>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 leading-relaxed max-w-sm mx-auto">
            Please contact your Department Chairperson or academic head to upload the official revised curriculum document.
          </div>
        </div>
      )}
    </div>
  );
}

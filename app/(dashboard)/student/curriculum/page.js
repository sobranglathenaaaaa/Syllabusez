"use client";

import { useState } from "react";
import { BookOpen, Printer, CheckCircle, HelpCircle, Layers, FileText } from "lucide-react";

export default function CurriculumPage() {
  const [activeYear, setActiveYear] = useState("all");

  const handlePrint = () => {
    window.print();
  };

  // Data structure for Curriculum semesters
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
    { code: "OFAD 012", title: "Personal and Professional Development", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "JAPA 101", title: "Japanese 1", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "SPAN 101", title: "Spanish 1", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 011", title: "Technical Documentation and Presentation Skills in ICT", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "COMP 047", title: "E-Commerce", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "MATH 018", title: "Linear Algebra with Simulation Software", lec: 3, lab: 0, units: 3, prereq: "None" },
    { code: "STAT 013", title: "Inferential Statistics", lec: 3, lab: 0, units: 3, prereq: "None" }
  ];

  const regularElectiveOptions = [
    { code: "INTE 351", title: "Systems Analysis and Design", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 352", title: "Systems Testing and Automation", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 361", title: "Advanced Computing Techniques", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 362", title: "Quality Assurance", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 371", title: "Web Systems and Technologies", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 372", title: "IT Audit and Controls", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 481", title: "Event Driven Programming", lec: 2, lab: 3, units: 3, prereq: "None" },
    { code: "INTE 482", title: ".NET Fundamentals", lec: 2, lab: 3, units: 3, prereq: "None" }
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

  // Semester Total calculator helper
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
              {/* Semester Totals */}
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

  return (
    <div className="space-y-6">
      {/* Action Header bar - Hides during physical print */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Curriculum Sheet Catalog</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Polytechnic University of the Philippines</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-800/10 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Download / Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter - Hides during print */}
      <div className="flex flex-wrap gap-1.5 print:hidden">
        {[
          { id: "all", label: "Full Curriculum" },
          { id: "1", label: "First Year" },
          { id: "2", label: "Second Year" },
          { id: "3", label: "Third Year" },
          { id: "4", label: "Fourth Year" },
          { id: "electives", label: "Electives Library" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveYear(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeYear === tab.id
                ? "bg-[#800000] text-white shadow-sm"
                : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Official Curriculum Sheet Template - Look exactly like standard University Document */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 lg:p-10 space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Document Official University Header */}
        <div className="text-center border-b border-gray-300 pb-6 space-y-2 print:pb-4">
          <span className="text-xs font-black uppercase tracking-widest text-[#800000] block print:text-black">Curriculum Sheet</span>
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

        {/* --- FIRST YEAR --- */}
        {(activeYear === "all" || activeYear === "1") && (
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              First Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("FIRST YEAR – 1st Semester", firstYear1stSem)}
              {renderSemesterTable("FIRST YEAR – 2nd Semester", firstYear2ndSem)}
            </div>
          </div>
        )}

        {/* --- SECOND YEAR --- */}
        {(activeYear === "all" || activeYear === "2") && (
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Second Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("SECOND YEAR – 1st Semester", secondYear1stSem)}
              {renderSemesterTable("SECOND YEAR – 2nd Semester", secondYear2ndSem)}
            </div>
          </div>
        )}

        {/* --- THIRD YEAR --- */}
        {(activeYear === "all" || activeYear === "3") && (
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
        )}

        {/* --- FOURTH YEAR --- */}
        {(activeYear === "all" || activeYear === "4") && (
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Fourth Year Curriculum
            </h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {renderSemesterTable("FOURTH YEAR – 1st Semester", fourthYear1stSem)}
              {renderSemesterTable("FOURTH YEAR – 2nd Semester", fourthYear2ndSem)}
            </div>
          </div>
        )}

        {/* --- ELECTIVES DIRECTORY --- */}
        {(activeYear === "all" || activeYear === "electives") && (
          <div className="space-y-8 pt-4 border-t border-gray-300">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-900 bg-red-50/50 border-l-4 border-[#800000] pl-2.5 py-1 print:text-black print:bg-transparent print:border-black">
              Elective Course Libraries
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Option A: Free Electives */}
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

              {/* Option B: IT Electives */}
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

            {/* Option C: Common Electives */}
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
                  <tbody className="divide-y divide-gray-200 grid-cols-2">
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
        )}

        {/* Document Footer seal/disclaimer */}
        <div className="border-t border-gray-300 pt-6 text-[10px] text-gray-400 font-semibold flex flex-col sm:flex-row justify-between items-center gap-2 print:pt-4">
          <span>Official Syllabus Registry & Academic Portal • PUP San Juan Branch</span>
          <span>Approved: Academic Year 2022 - 2023 • Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}

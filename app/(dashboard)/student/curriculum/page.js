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
  const [customCurricula, setCustomCurricula] = useState({});
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState("document");
  const [previewText, setPreviewText] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const selectedDepartmentObject = departments.find(d => d.id === selectedDept);

  const fetchMetadata = async () => {
    try {
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
      const defaultDept = bsitDept ? bsitDept.id : depts[0]?.id;
      if (defaultDept) {
        setSelectedDept(defaultDept);
        if (curriculaMap[defaultDept]) {
          setViewMode("document");
        }
      }
    } catch (error) {
      console.error("Failed to load student curriculum sheet:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    const activeSheet = customCurricula[selectedDept];
    if (activeSheet) {
      const ext = activeSheet.file_name.split('.').pop().toLowerCase();
      if (ext === "txt" || ext === "docx") {
        const fetchContent = async () => {
          setLoadingText(true);
          setPreviewText("");
          try {
            const safeFileName = `${selectedDept}_${activeSheet.file_name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
            if (ext === "txt") {
              const fileUrl = `/uploads/curricula/${safeFileName}`;
              const res = await fetch(fileUrl);
              setPreviewText(await res.text());
            } else if (ext === "docx") {
              const res = await fetch(`/api/curriculum/preview?fileName=${encodeURIComponent(safeFileName)}`);
              setPreviewText(await res.text());
            }
          } catch (err) {
            setPreviewText(`Failed to load ${ext} document contents.`);
          }
          setLoadingText(false);
        };
        fetchContent();
      }
    }
  }, [selectedDept, customCurricula]);

  const handlePrint = () => {
    window.print();
  };

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

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
        </div>
      </div>

      {customCurricula[selectedDept] ? (
        (() => {
          const sheet = customCurricula[selectedDept];
          const fileUrl = `/uploads/curricula/${selectedDept}_${sheet.file_name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
          const fileExt = sheet.file_name.split('.').pop().toLowerCase();
          const programCourses = courses.filter(c => c.program_id === selectedDept);

          // If no parsed courses exist, derive structured entries from the original uploaded document
          const getEffectiveCourses = () => {
            if (programCourses.length > 0) return programCourses;
            if (!previewText) return [];

            // Normalize HTML/docx preview to plain text lines
            const raw = previewText.replace(/<br\/?\s*>/gi, "\n").replace(/<[^>]+>/g, "\n").replace(/\u00A0/g, ' ').trim();
            const lines = raw.split(/\r?\n/).map(l => l.replace(/\s{2,}/g, ' ').trim()).filter(Boolean);

            const parseLine = (ln) => {
              let code = '';
              let title = ln;
              let units = '';

              const mCode = ln.match(/^([A-Z]{2,}\s*\d{1,4}[A-Z]?)[\-:\s]+(.+)$/i);
              if (mCode) {
                code = mCode[1].replace(/\s+/g, ' ').trim();
                title = mCode[2].trim();
              }

              const mUnits = title.match(/(\(|-)?\s*(\d{1,2}(?:\.\d+)?)\s*(units?)?\)?\s*$/i);
              if (mUnits) {
                units = mUnits[2];
                title = title.replace(mUnits[0], '').trim();
              }

              if (!code) {
                const mInner = ln.match(/([A-Z]{2,}\s*\d{1,4}[A-Z]?)/i);
                if (mInner) code = mInner[1].replace(/\s+/g, ' ').trim();
              }

              return {
                id: `doc-${Math.random().toString(36).slice(2,9)}`,
                code,
                title,
                units: units || '',
                prereq: '',
                coreq: '',
                year_level: 'UNASSIGNED',
                semester: 'Unassigned Semester'
              };
            };

            // detect headings and assign current year/semester while iterating lines
            let currentYear = 'UNASSIGNED';
            let currentSemester = 'Unassigned Semester';

            const yearPatterns = [
              [/first year/i, 'FIRST YEAR'], [/1st year/i, 'FIRST YEAR'], [/year 1/i, 'FIRST YEAR'],
              [/second year/i, 'SECOND YEAR'], [/2nd year/i, 'SECOND YEAR'], [/year 2/i, 'SECOND YEAR'],
              [/third year/i, 'THIRD YEAR'], [/3rd year/i, 'THIRD YEAR'], [/year 3/i, 'THIRD YEAR'],
              [/fourth year/i, 'FOURTH YEAR'], [/4th year/i, 'FOURTH YEAR'], [/year 4/i, 'FOURTH YEAR']
            ];

            const semPatterns = [
              [/1st semester/i, '1st Semester'], [/first semester/i, '1st Semester'], [/semester 1/i, '1st Semester'],
              [/2nd semester/i, '2nd Semester'], [/second semester/i, '2nd Semester'], [/semester 2/i, '2nd Semester'],
              [/summer/i, 'Summer Term'], [/summer term/i, 'Summer Term']
            ];

            const parsed = [];
            for (const ln of lines) {
              const low = ln.toLowerCase();

              // headings may appear alone or combined like "FIRST YEAR - 1st Semester"
              let matchedHeading = false;
              for (const [rx, name] of yearPatterns) {
                if (rx.test(low)) { currentYear = name; matchedHeading = true; }
              }
              for (const [rx, name] of semPatterns) {
                if (rx.test(low)) { currentSemester = name; matchedHeading = true; }
              }
              if (matchedHeading) continue;

              const entry = parseLine(ln);
              entry.year_level = currentYear;
              entry.semester = currentSemester;
              if ((entry.title && entry.title.length > 5) || entry.code) parsed.push(entry);
            }
            return parsed;
          };

          const renderOriginalDocumentSection = () => {
            if (fileExt === "pdf") {
              return (
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#800000]/5 border-b border-gray-100">
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Original Curriculum Document</h5>
                  </div>
                  <div className="h-[48vh]">
                    <object data={fileUrl} type="application/pdf" className="w-full h-full" aria-label="PDF Viewer">
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 p-8">
                        <p className="text-xs text-center">Your browser cannot display this PDF inline.</p>
                        <a href={fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#800000] text-white text-xs font-bold rounded-xl">Open PDF in new tab</a>
                      </div>
                    </object>
                  </div>
                </div>
              );
            }

            if (fileExt === "txt") {
              return (
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#800000]/5 border-b border-gray-100">
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Original Curriculum Document</h5>
                  </div>
                  <div className="p-6 bg-gray-50 text-xs text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[48vh] font-mono">
                    {previewText}
                  </div>
                </div>
              );
            }

            if (fileExt === "docx") {
              return (
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                  <div className="px-4 py-3 bg-[#800000]/5 border-b border-gray-100">
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-gray-800">Original Curriculum Document</h5>
                  </div>
                  <div className="p-6 bg-gray-50 overflow-y-auto max-h-[48vh] text-sm text-gray-800">
                    {loadingText ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewText }} />
                    )}
                  </div>
                </div>
              );
            }

            return null;
          };

          // Grouping — use effective courses (from DB or derived from original document)
          const effectiveCourses = getEffectiveCourses();
          const grouped = {};
          effectiveCourses.forEach(course => {
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
                    <span>Uploaded Curriculum Sheet: {sheet.file_name} (Dynamic Catalog)</span>
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Uploaded {formatDate(sheet.uploaded_at)}</span>
                  </p>
                </div>

                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#800000] hover:bg-red-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Original File</span>
                </a>
              </div>

              <div className="flex border-b border-gray-100 gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 text-xs font-extrabold transition-all border-b-2 -mb-px ${viewMode === "grid" ? "border-[#800000] text-[#800000]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Dynamic Catalog Grid
                </button>
                <button
                  onClick={() => setViewMode("document")}
                  className={`px-4 py-2 text-xs font-extrabold transition-all border-b-2 -mb-px ${viewMode === "document" ? "border-[#800000] text-[#800000]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Original Document Viewer
                </button>
              </div>

              {viewMode === "document" ? (
                <div className="w-full h-[65vh] rounded-2xl overflow-hidden bg-gray-50">
                  {(() => {
                    const ext = sheet.file_name.split('.').pop().toLowerCase();
                    if (ext === "pdf") {
                      return (
                        <object data={fileUrl} type="application/pdf" className="w-full h-full rounded-2xl border border-gray-200 bg-white" aria-label="PDF Viewer">
                          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 p-8">
                            <FileText className="w-10 h-10 text-gray-300" />
                            <p className="text-xs font-semibold text-center">Your browser cannot display this PDF inline.</p>
                            <a href={fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#800000] text-white text-xs font-bold rounded-xl">Open PDF in new tab</a>
                          </div>
                        </object>
                      );
                    } else if (ext === "txt") {
                      return (
                        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col">
                          {loadingText ? (
                            <div className="flex-grow flex flex-col items-center justify-center gap-3">
                              <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-gray-500 font-semibold">Loading text contents...</span>
                            </div>
                          ) : (
                            <pre className="flex-grow p-6 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono whitespace-pre-wrap overflow-y-auto text-gray-800 text-left">
                              {previewText}
                            </pre>
                          )}
                        </div>
                      );
                    } else if (ext === "docx") {
                      return (
                        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col">
                          {loadingText ? (
                            <div className="flex-grow flex flex-col items-center justify-center gap-3">
                              <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-gray-500 font-semibold">Loading document...</span>
                            </div>
                          ) : (
                            <div 
                              className="flex-grow p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm overflow-y-auto text-gray-800 text-left docx-viewer"
                              dangerouslySetInnerHTML={{ __html: previewText }} 
                            />
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-4">
                          <AlertTriangle className="w-12 h-12 text-amber-500" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-900">Preview Not Available</h4>
                            <p className="text-xs text-gray-500 max-w-sm">Inline preview is not available for this file type (.{ext}). Please download the file to view its contents.</p>
                          </div>
                          <a href={fileUrl} download className="px-5 py-2.5 bg-[#800000] text-white text-xs font-bold rounded-xl flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download to View
                          </a>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="space-y-8">
                  {renderOriginalDocumentSection()}
                  {effectiveCourses.length === 0 ? (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <span className="text-xs font-semibold">No parsed courses found. Reference curriculum might be empty.</span>
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
              )}
            </div>
          );
        })()
      ) : (

        // --- No custom upload ---
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

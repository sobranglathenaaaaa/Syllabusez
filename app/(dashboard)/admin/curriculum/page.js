"use client";

import { useState, useEffect, useRef } from "react";
import DynamicCurriculumView from "@/components/curriculum/DynamicCurriculumView";
import {
  BookOpen,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  HelpCircle,
  Eye,
  X,
  AlertTriangle
} from "lucide-react";

export default function AdminCurriculumPage() {
  const [programs, setPrograms] = useState([]);
  const [customCurricula, setCustomCurricula] = useState({});
  const [newProgramName, setNewProgramName] = useState("");
  const [programsLoading, setProgramsLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [actionMessage, setActionMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Which program's catalog to preview below the grid
  const [previewProgramId, setPreviewProgramId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, course: null });

  const fileRefs = useRef({});

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchMetadata = async () => {
    try {
      const progRes = await fetch("/api/programs", { cache: "no-store" });
      const progData = await progRes.json();
      const nextPrograms = progData.programs || [];
      setPrograms(nextPrograms);

      const currRes = await fetch("/api/curriculum", { cache: "no-store" });
      const currData = await currRes.json();
      const curriculaMap = {};
      currData.curricula?.forEach(c => { curriculaMap[c.program_id] = c; });
      setCustomCurricula(curriculaMap);

      const firstUploadedProgram = nextPrograms.find(program => curriculaMap[program.id]);
      if (!previewProgramId && firstUploadedProgram) {
        setPreviewProgramId(firstUploadedProgram.id);
      }

      const coursesRes = await fetch("/api/courses", { cache: "no-store" });
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);

      const usersRes = await fetch("/api/users?role=instructor", { cache: "no-store" });
      const usersData = await usersRes.json();
      setInstructors(usersData.users || []);
    } catch (error) {
      console.error("Failed to load curriculum workspace:", error);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMetadata(); }, []);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const triggerMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleAddProgram = async () => {
    if (!newProgramName.trim()) { triggerMessage("error", "Program name cannot be empty"); return; }
    try {
      setProgramsLoading(true);
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProgramName.trim() })
      });
      if (res.ok) { triggerMessage("success", "Program added successfully"); setNewProgramName(""); await fetchMetadata(); }
      else { const err = await res.json(); triggerMessage("error", err.error || "Failed to add program"); }
    } catch { triggerMessage("error", "Network error while adding program"); }
    finally { setProgramsLoading(false); }
  };

  const handleFileChange = (programId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/(\.pdf|\.txt|\.doc|\.docx)$/i.exec(file.name)) {
      triggerMessage("error", "Invalid file type. Supported: .pdf, .txt, .doc, .docx");
      e.target.value = ""; return;
    }
    setSelectedFiles(prev => ({ ...prev, [programId]: file }));
  };

  const handleUpload = async (programId) => {
    const file = selectedFiles[programId];
    if (!file) return;
    setUploading(prev => ({ ...prev, [programId]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("programId", programId);
    try {
      const res = await fetch("/api/curriculum", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        const parsed = Number(data.parsedCount || 0);

        if (parsed > 0) {
          triggerMessage("success", `Uploaded "${data.fileName}". Structured ${parsed} courses into the dynamic curriculum.`);
        } else {
          triggerMessage("error", `Uploaded "${data.fileName}" but no courses could be structured. Try a clearer curriculum sheet format.`);
        }

        setSelectedFiles(prev => { const c = { ...prev }; delete c[programId]; return c; });
        if (fileRefs.current[programId]) fileRefs.current[programId].value = "";
        await fetchMetadata();
        // Only open the preview modal automatically when parsing produced courses
        if (parsed > 0) setPreviewProgramId(programId);
      } else {
        const err = await res.json();
        triggerMessage("error", err.error || "Upload failed.");
      }
    } catch { triggerMessage("error", "Network connection failure."); }
    setUploading(prev => ({ ...prev, [programId]: false }));
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm("Delete this program and all related curriculum entries?")) return;
    try {
      const res = await fetch(`/api/programs?programId=${programId}`, { method: "DELETE" });
      if (res.ok) { triggerMessage("success", "Program deleted."); await fetchMetadata(); }
      else { const err = await res.json(); triggerMessage("error", err.error || "Failed to delete program"); }
    } catch { triggerMessage("error", "Network error."); }
  };

  const handleDelete = async (programId) => {
    if (!confirm("Delete this custom curriculum? It will revert to the default catalog.")) return;
    try {
      const res = await fetch(`/api/curriculum?programId=${programId}`, { method: "DELETE" });
      if (res.ok) { triggerMessage("success", "Custom curriculum deleted. Reverted to default."); await fetchMetadata(); }
      else { triggerMessage("error", "Failed to delete custom sheet."); }
    } catch { triggerMessage("error", "Network connection failure."); }
  };

  const handleSaveInstructors = async (courseId, selectedInstructorIds) => {
    try {
      const res = await fetch("/api/course-instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId, instructor_ids: selectedInstructorIds })
      });
      if (res.ok) {
        triggerMessage("success", "Instructors assigned successfully.");
        await fetchMetadata();
        setAssignModal({ open: false, course: null });
      } else {
        const err = await res.json();
        triggerMessage("error", err.error || "Failed to assign instructors");
      }
    } catch {
      triggerMessage("error", "Network connection failure.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  // Derive which program is being previewed (for catalog display)
  const previewProgram = previewProgramId ? programs.find(p => p.id === previewProgramId) : null;

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Initializing Curriculum Registry workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      {actionMessage && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-top-4 duration-300 border ${actionMessage.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          <span className="text-xs font-bold leading-relaxed">{actionMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full"><BookOpen className="w-6 h-6" /></div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Curriculum Registry Manager</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Academic Programs of PUP San Juan</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl">
          <HelpCircle className="w-4 h-4 text-[#800000]" />
          <span>Upload a curriculum sheet to build the structured dynamic catalog for each program.</span>
        </div>
      </div>

      {/* Add New Program */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="New program name"
          value={newProgramName}
          onChange={(e) => setNewProgramName(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
        />
        <button
          onClick={handleAddProgram}
          disabled={programsLoading}
          className="px-4 py-2 bg-[#800000] hover:bg-red-900 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
        >
          {programsLoading ? "Adding..." : "Add Program"}
        </button>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => {
          const customSheet = customCurricula[program.id];
          const chosenFile = selectedFiles[program.id];
          const isUploading = uploading[program.id];
          const isSelected = previewProgramId === program.id;

          return (
            <div
              key={program.id}
              className={`bg-white rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between ${isSelected ? "border-[#800000]/40 ring-2 ring-[#800000]/10" : "border-gray-100"}`}
            >
              {/* Program Header */}
              <div className="p-6 border-b border-gray-50 space-y-3 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2 rounded-xl bg-red-50 text-[#800000] font-bold text-xs flex items-center justify-center shadow-inner border border-red-100">
                      {program.name.match(/\(([^)]+)\)/)?.[1] || program.name}
                    </div>
                    <button onClick={() => handleDeleteProgram(program.id)} className="p-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-1 border border-red-100 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {customSheet ? (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /><span>Document Active</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-gray-100 text-gray-500 border border-gray-200 rounded-lg">Pending Upload</span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                {/* Active Sheet Info */}
                {customSheet ? (
                  <div className="p-4 border border-green-100 rounded-2xl bg-green-50/20 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-[200px]" title={customSheet.file_name}>{customSheet.file_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Uploaded {formatDate(customSheet.uploaded_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-green-100/50 mt-2">
                      <button
                        onClick={() => setPreviewProgramId(isSelected ? null : program.id)}
                        className={`px-3 py-1.5 font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 shadow-sm ${isSelected ? "bg-gray-200 text-gray-700" : "bg-[#800000] hover:bg-red-900 text-white"}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSelected ? "Hide Preview" : "View Curriculum"}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /><span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center">
                    <button
                      onClick={() => setPreviewProgramId(isSelected ? null : program.id)}
                      className={`px-3 py-1.5 font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 mx-auto mb-2 ${isSelected ? "bg-gray-200 text-gray-700" : "bg-[#800000] hover:bg-red-900 text-white"}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSelected ? "Hide Status" : "View Status"}</span>
                    </button>
                    <p className="text-xs font-medium text-gray-400">No curriculum sheet uploaded for this program.</p>
                  </div>
                )}

                {/* Upload Form */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Updated Curriculum</span>
                  <div className="flex gap-2 items-center">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2.5 border border-dashed border-[#800000]/20 hover:border-[#800000]/60 text-gray-600 hover:text-gray-900 rounded-xl font-semibold text-xs cursor-pointer transition-all bg-gray-50/20">
                      <Upload className="w-4 h-4 text-[#800000]" />
                      <span className="truncate max-w-[150px]">{chosenFile ? chosenFile.name : "Select TXT, PDF, or Word"}</span>
                      <input
                        type="file"
                        ref={el => fileRefs.current[program.id] = el}
                        accept=".pdf,.txt,.doc,.docx"
                        onChange={(e) => handleFileChange(program.id, e)}
                        className="hidden"
                      />
                    </label>
                    {chosenFile && (
                      <button
                        onClick={() => handleUpload(program.id)}
                        disabled={isUploading}
                        className="px-4 py-2.5 bg-[#800000] hover:bg-red-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        {isUploading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        <span>Upload</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Curriculum Preview ── */}
      {previewProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

            {/* Preview header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-[#800000] rounded-xl"><BookOpen className="w-5 h-5" /></div>
              <div>
                <span className="text-[10px] font-bold text-[#800000] uppercase tracking-widest block">{previewProgram.name}</span>
                <h4 className="font-extrabold text-sm text-gray-900">Dynamic Curriculum</h4>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewProgramId(null)}
                className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-10 space-y-8 overflow-y-auto flex-1">
            {customCurricula[previewProgram.id] ? (
              (() => {
                const sheet = customCurricula[previewProgram.id];
                const programCourses = courses.filter(c => c.program_id === previewProgram.id);

                return (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-gray-100">
                      <h5 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#800000]" />
                        Structured curriculum from {sheet.file_name}
                      </h5>
                      <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> Uploaded {formatDate(sheet.uploaded_at)}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-2">
                        This structured view is what instructors and students see. The original upload is kept on the server for processing only.
                      </p>
                    </div>

                    <DynamicCurriculumView
                      courses={programCourses}
                      onAssignInstructor={(course) => setAssignModal({ open: true, course })}
                      emptyMessage="No structured courses yet. Upload a curriculum sheet to generate the dynamic layout."
                    />
                  </div>
                );
              })()
            ) : (
              /* No upload placeholder */
              <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-8 text-center space-y-6 max-w-xl mx-auto py-12">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-gray-900 leading-tight">Curriculum Pending Upload</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    No official customized curriculum document has been uploaded for this program yet:
                  </p>
                  <span className="inline-block mt-2 px-3 py-1.5 bg-amber-50 text-amber-800 font-black text-xs rounded-xl border border-amber-100">
                    {previewProgram.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {assignModal.open && assignModal.course && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h4 className="font-bold text-gray-900 text-sm">Assign Instructors</h4>
              <button onClick={() => setAssignModal({ open: false, course: null })} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{assignModal.course.code}</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{assignModal.course.title}</p>
              </div>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {instructors.map((instructor) => {
                  const isAssigned = assignModal.course.instructors?.some(inst => inst.id === instructor.id);
                  return (
                    <label key={instructor.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        defaultChecked={isAssigned}
                        className="w-4 h-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000]"
                        id={`inst-${instructor.id}`}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800">{instructor.full_name}</span>
                        <span className="text-[10px] text-gray-500">{instructor.email}</span>
                      </div>
                    </label>
                  );
                })}
                {instructors.length === 0 && (
                  <p className="text-xs text-gray-500 italic text-center py-4">No instructors found.</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setAssignModal({ open: false, course: null })} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={() => {
                  const selectedIds = Array.from(document.querySelectorAll('input[id^="inst-"]:checked')).map(el => el.id.replace('inst-', ''));
                  handleSaveInstructors(assignModal.course.id, selectedIds);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-red-900 rounded-xl shadow-sm transition-colors"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

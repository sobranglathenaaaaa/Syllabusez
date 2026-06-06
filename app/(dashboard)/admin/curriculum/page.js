"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  HelpCircle,
  Eye,
  X
} from "lucide-react";

export default function AdminCurriculumPage() {
  const [programs, setPrograms] = useState([]);
  const [customCurricula, setCustomCurricula] = useState({});
  const [newProgramName, setNewProgramName] = useState("");
  const [programsLoading, setProgramsLoading] = useState(false);


  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploading, setUploading] = useState({});
  const [actionMessage, setActionMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preview Modal state
  const [previewFile, setPreviewFile] = useState(null); // { url, name, programName }
  const [previewText, setPreviewText] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  // File input refs mapped by programId
  const fileRefs = useRef({});

  const handleAddProgram = async () => {
    if (!newProgramName.trim()) {
      triggerMessage("error", "Program name cannot be empty");
      return;
    }
    try {
      setProgramsLoading(true);
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProgramName.trim() })
      });
      if (res.ok) {
        triggerMessage("success", "Program added successfully");
        setNewProgramName("");
        await fetchMetadata();
      } else {
        const err = await res.json();
        triggerMessage("error", err.error || "Failed to add program");
      }
    } catch (e) {
      console.error(e);
      triggerMessage("error", "Network error while adding program");
    } finally {
      setProgramsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const progRes = await fetch("/api/programs");
      const progData = await progRes.json();
      setPrograms(progData.programs || []);

      const currRes = await fetch("/api/curriculum");
      const currData = await currRes.json();

      // Map curricula records by program_id
      const curriculaMap = {};
      currData.curricula?.forEach(c => {
        curriculaMap[c.program_id] = c;
      });
      setCustomCurricula(curriculaMap);
    } catch (error) {
      console.error("Failed to load curriculum workspace:", error);
    }
    setLoading(false);
  };

  // Removed duplicate handleDeleteProgram definition to avoid conflict.


  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleFileChange = (programId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extensions
    const allowedExtensions = /(\.pdf|\.txt|\.doc|\.docx)$/i;
    if (!allowedExtensions.exec(file.name)) {
      triggerMessage("error", "Invalid file type. Supported extensions: .pdf, .txt, .doc, .docx");
      e.target.value = "";
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [programId]: file
    }));
  };

  const triggerMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4000);
  };

  const handleUpload = async (programId) => {
    const file = selectedFiles[programId];
    if (!file) return;

    setUploading(prev => ({ ...prev, [programId]: true }));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("programId", programId);

    try {
      const res = await fetch("/api/curriculum", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        triggerMessage("success", `Successfully uploaded "${data.fileName}" for the program.`);
        // Clean chosen file
        setSelectedFiles(prev => {
          const clone = { ...prev };
          delete clone[programId];
          return clone;
        });
        if (fileRefs.current[programId]) {
          fileRefs.current[programId].value = "";
        }
        await fetchMetadata();
      } else {
        const err = await res.json();
        triggerMessage("error", err.error || "Failed to upload curriculum.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      triggerMessage("error", "Network connection failure.");
    }
    setUploading(prev => ({ ...prev, [programId]: false }));
  };

  const handleDeleteProgram = async (programId) => {
    if (!confirm("Are you sure you want to delete this program? All related curriculum entries will be removed.")) return;
    try {
      const res = await fetch(`/api/programs?programId=${programId}`, { method: "DELETE" });
      if (res.ok) {
        triggerMessage("success", "Program deleted successfully");
        await fetchMetadata();
      } else {
        const err = await res.json();
        triggerMessage("error", err.error || "Failed to delete program");
      }
    } catch (e) {
      console.error(e);
      triggerMessage("error", "Network error while deleting program");
    }
  };

  const handleDelete = async (programId) => {
    if (!confirm("Are you sure you want to delete this custom curriculum? It will immediately fallback to the default interactive portal catalog.")) {
      return;
    }

    try {
      const res = await fetch(`/api/curriculum?programId=${programId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        triggerMessage("success", "Successfully deleted custom curriculum. Active sheet reverted to default.");
        await fetchMetadata();
      } else {
        triggerMessage("error", "Failed to delete custom sheet.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      triggerMessage("error", "Network connection failure.");
    }
  };

  
;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getCustomUrl = (programId, fileName) => {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    return `/uploads/curricula/${programId}_${safeFileName}`;
  };

  const openPreview = async (programId, fileName, programName) => {
    const fileUrl = getCustomUrl(programId, fileName);
    setPreviewFile({ url: fileUrl, name: fileName, programName });

    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === "txt") {
      setLoadingText(true);
      setPreviewText("");
      try {
        const res = await fetch(fileUrl);
        const text = await res.text();
        setPreviewText(text);
      } catch (err) {
        setPreviewText("Failed to load text document contents.");
      }
      setLoadingText(false);
    }
  };

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
      {/* Toast Alert Notifications */}
      {actionMessage && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md animate-in fade-in slide-in-from-top-4 duration-300 border ${actionMessage.type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
          }`}>
          {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
          <span className="text-xs font-bold leading-relaxed">{actionMessage.text}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-[#800000] rounded-full">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Curriculum Registry Manager</h3>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Academic Programs of PUP San Juan</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl">
          <HelpCircle className="w-4 h-4 text-[#800000]" />
          <span>Upload TXT, PDF, or Word files to override default syllabi catalogs.</span>
        </div>
      </div>

      {/* Add New Program */}
      <div className="flex items-center gap-4 mb-4">
        <input type="text" placeholder="New program name" value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]" />
        <button onClick={handleAddProgram} disabled={programsLoading} className="px-3 py-1 bg-[#800000] hover:bg-red-900 text-white rounded-md disabled:opacity-50">
          {programsLoading ? "Adding..." : "Add Program"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => {
          const customSheet = customCurricula[program.id];
          const chosenFile = selectedFiles[program.id];
          const isUploading = uploading[program.id];

          return (
            <div
              key={program.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Program Header */}
              <div className="p-6 border-b border-gray-50 space-y-3 bg-gradient-to-br from-white to-gray-50/30">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-10 rounded-xl bg-red-50 text-[#800000] font-bold text-xs flex items-center justify-center shadow-inner border border-red-100 flex-shrink-0">
                      {program.name.match(/\(([^)]+)\)/)?.[1] || program.name}
                    </div>
                    <button onClick={() => handleDeleteProgram(program.id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  {customSheet ? (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Custom Document Active</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-extrabold bg-gray-100 text-gray-500 border border-gray-200 rounded-lg">
                      Default Catalog Active
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between gap-6">

                {/* Current Active Sheet Details */}
                {customSheet ? (
                  <div className="p-4 border border-green-100 rounded-2xl bg-green-50/20 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-[200px]" title={customSheet.file_name}>
                        {customSheet.file_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Uploaded {formatDate(customSheet.uploaded_at)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-green-100/50 mt-2">
                      <button
                        onClick={() => openPreview(program.id, customSheet.file_name, program.name)}
                        className="px-3 py-1.5 bg-[#800000] hover:bg-red-900 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                      <a
                        href={getCustomUrl(program.id, customSheet.file_name)}
                        download
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 text-center text-xs font-medium text-gray-400">
                    No custom sheet uploaded. Running standard PUP digital grid catalog.
                  </div>
                )}

                {/* Upload Action Form */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Upload Updated Curriculum</span>

                  <div className="flex gap-2 items-center">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2.5 border border-dashed border-[#800000]/20 hover:border-[#800000]/60 text-gray-600 hover:text-gray-900 rounded-xl font-semibold text-xs cursor-pointer transition-all bg-gray-50/20">
                      <Upload className="w-4 h-4 text-[#800000]" />
                      <span className="truncate max-w-[150px]">
                        {chosenFile ? chosenFile.name : "Select TXT, PDF, or Word"}
                      </span>
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
                        {isUploading ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
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

      {/* --- PREMIUM HIGH-FIDELITY PREVIEW MODAL --- */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-gray-100 relative overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#800000] uppercase tracking-widest">{previewFile.programName}</span>
                <button
                  onClick={() => handleDeleteProgram(previewFile.programId)}
                  className="ml-2 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete Program
                </button>
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#800000]" />
                  <span>Curriculum Sheet Preview: {previewFile.name}</span>
                </h4>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Dynamic Viewers based on extension */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100/30 flex flex-col justify-center">
              {(() => {
                const ext = previewFile.name.split('.').pop().toLowerCase();

                if (ext === "pdf") {
                  return (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-full rounded-2xl border border-gray-200 bg-white shadow-sm"
                      title="Curriculum Document Viewer"
                    />
                  );
                }

                if (ext === "txt") {
                  return (
                    <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 flex flex-col">
                      {loadingText ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-500 font-semibold">Loading text contents...</span>
                        </div>
                      ) : (
                        <pre className="flex-1 p-6 bg-gray-50 rounded-xl border border-gray-100 text-xs font-mono whitespace-pre-wrap overflow-y-auto text-gray-800 text-left">
                          {previewText}
                        </pre>
                      )}
                    </div>
                  );
                }

                // Word document online view via Google Docs Viewer
                const googleViewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + previewFile.url)}&embedded=true`;
                return (
                  <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 bg-amber-50 border-b border-amber-100 text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
                      <HelpCircle className="w-4.5 h-4.5" />
                      <span>If the Office Document doesn't load below, please use the direct download link at the bottom.</span>
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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
              <span className="text-[10px] font-semibold text-gray-400">PUP San Juan Syllabus Management Portal</span>
              <a
                href={previewFile.url}
                download
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Curriculum</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

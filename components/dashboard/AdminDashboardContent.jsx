"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";

export function AdminDashboardContent() {
  const [pendingSyllabi, setPendingSyllabi] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Review Modal State
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [reviewAction, setReviewAction] = useState(""); // "approve" | "reject"
  const [actionPending, setActionPending] = useState(false);

  // Fetch pending submissions and filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch programs
      const deptsRes = await fetch("/api/programs");
      const deptsData = await deptsRes.json();
      setDepartments(deptsData.programs || []);

      // Fetch all courses
      const coursesRes = await fetch("/api/courses");
      const coursesData = await coursesRes.json();
      setCourses(coursesData.courses || []);

      // Fetch pending syllabi
      const params = new URLSearchParams({ status: "submitted" });
      if (selectedDept) params.set("programId", selectedDept);
      if (selectedCourse) params.set("courseId", selectedCourse);
      
      const syllabiRes = await fetch(`/api/syllabi?${params.toString()}`);
      const syllabiData = await syllabiRes.json();
      setPendingSyllabi(syllabiData.syllabi || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
    setLoading(false);
  }, [selectedDept, selectedCourse]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Review Submission
  const handleReviewActionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSyllabus || !reviewAction) return;

    if (reviewAction === "reject" && !comment.trim()) {
      alert("Please provide a rejection comment explaining what needs to be edited.");
      return;
    }

    setActionPending(true);
    try {
      const res = await fetch(`/api/syllabi/${selectedSyllabus.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewAction === "approve" ? "approved" : "rejected",
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setCommentModalOpen(false);
        setViewModalOpen(false);
        setComment("");
        setReviewAction("");
        setSelectedSyllabus(null);
        // Refresh table
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review action error:", err);
      alert("Network error occurred.");
    }
    setActionPending(false);
  };

  const openCommentModal = (syllabus, action) => {
    setSelectedSyllabus(syllabus);
    setReviewAction(action);
    setComment("");
    setCommentModalOpen(true);
  };

  // Filtered courses dropdown based on selected program
  const filteredCoursesDropdown = selectedDept
    ? courses.filter(c => c.program_id === selectedDept)
    : courses;

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Pending Syllabus Approvals</h3>
          <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Program Review Panel</p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setSelectedCourse(""); // Reset course selection
              }}
              className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white"
            >
              <option value="">All Programs</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name.split(" (")[0] || dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedCourse}
              disabled={loading}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white disabled:opacity-50"
            >
              <option value="">All Courses</option>
              {filteredCoursesDropdown.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-red-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Loading pending syllabi...</span>
          </div>
        ) : pendingSyllabi.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Instructor</th>
                  <th className="px-6 py-4 text-center">Version</th>
                  <th className="px-6 py-4 text-center">Submitted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingSyllabi.map((syllabus) => (
                  <tr key={syllabus.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-red-900 block">{syllabus.code}</span>
                      <span className="text-xs font-medium text-gray-700 block mt-0.5">{syllabus.course_title}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                      {syllabus.instructor_name || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 rounded-md">
                        v{syllabus.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                      {new Date(syllabus.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSyllabus(syllabus);
                            setViewModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          title="View Syllabus Content"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        
                        <button
                          onClick={() => openCommentModal(syllabus, "approve")}
                          className="p-1.5 rounded-lg border border-green-100 hover:bg-green-50 text-green-600 hover:text-green-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => openCommentModal(syllabus, "reject")}
                          className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          title="Reject"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-red-50 text-[#800000] rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">All caught up!</h4>
            <p className="text-xs text-gray-400 font-medium">
              There are no pending syllabus submissions for review at this time.
            </p>
          </div>
        )}
      </div>

      {/* --- MODAL 1: VIEW FULL DETAILS --- */}
      {viewModalOpen && selectedSyllabus && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#800000] text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Syllabus Review</span>
                <h3 className="font-extrabold text-base">{selectedSyllabus.code} - {selectedSyllabus.course_title}</h3>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable details view - fully premium print structure */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-50/50">
              <SyllabusContentLoader syllabusId={selectedSyllabus.id} />
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-xs font-semibold text-gray-500">Submitted by: <strong className="text-gray-800">{selectedSyllabus.instructor_name}</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => openCommentModal(selectedSyllabus, "reject")}
                  className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold rounded-xl transition-all"
                >
                  Reject with Comments
                </button>
                <button
                  onClick={() => openCommentModal(selectedSyllabus, "approve")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow shadow-green-600/10"
                >
                  Approve Syllabus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: COMMENTS DIALOG (APPROVE OR REJECT) --- */}
      {commentModalOpen && selectedSyllabus && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              {reviewAction === "approve" ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Approve Syllabus</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>Reject Syllabus</span>
                </>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {reviewAction === "approve"
                ? "You are approving this syllabus. Add any notes/commendations (optional) for the instructor."
                : "You are rejecting this syllabus. You MUST provide detailed feedback on what changes are required."}
            </p>

            <form onSubmit={handleReviewActionSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Review Comments</label>
                <textarea
                  required={reviewAction === "reject"}
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={reviewAction === "approve" ? "Excellent work! (Optional)" : "Topic 2 outcomes need alignment; Grading component sums to 90%, please fix."}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommentModalOpen(false)}
                  disabled={actionPending}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionPending}
                  className={`px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all ${
                    reviewAction === "approve"
                      ? "bg-green-600 hover:bg-green-700 shadow-green-600/10"
                      : "bg-red-600 hover:bg-red-700 shadow-red-600/10"
                  } disabled:opacity-50`}
                >
                  {actionPending ? "Submitting..." : reviewAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent to fetch and render full syllabus content reactively
function SyllabusContentLoader({ syllabusId }) {
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSyllabusDetails = async () => {
      try {
        const res = await fetch(`/api/syllabi/${syllabusId}`);
        const data = await res.json();
        setSyllabus(data.syllabus);
      } catch (err) {
        console.error("Failed loading syllabus detail:", err);
      }
      setLoading(false);
    };
    fetchSyllabusDetails();
  }, [syllabusId]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Loading syllabus content details...</span>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="py-12 text-center text-xs text-red-500 font-bold flex items-center justify-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load syllabus details.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 space-y-8 shadow-sm">
      {/* Header Info */}
      <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">Course Details</span>
          <h4 className="text-xl font-black text-gray-900 mt-2">{syllabus.code} - {syllabus.title}</h4>
          <span className="text-xs font-medium text-gray-500 mt-1 block">Course Units: <strong>{syllabus.units} Units</strong></span>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-xs font-bold text-gray-400 block uppercase">Instructor</span>
          <span className="text-xs font-extrabold text-gray-700 block mt-1">{syllabus.instructor_name}</span>
          <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">{syllabus.instructor_email}</span>
        </div>
      </div>

      {/* 1. Learning Outcomes */}
      <div className="space-y-3">
        <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
          1. Course Learning Outcomes
        </h5>
        {syllabus.learning_outcomes?.length > 0 ? (
          <ol className="divide-y divide-gray-100 text-xs text-gray-600 bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
            {syllabus.learning_outcomes.map((item, i) => (
              <li key={i} className="px-4 py-3 flex gap-3 leading-relaxed">
                <span className="font-bold text-[#800000]">{i + 1}.</span>
                <span>{item.description}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-gray-400 italic pl-3">No outcomes specified.</p>
        )}
      </div>

      {/* 2. Weekly Plans */}
      <div className="space-y-3">
        <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
          2. Weekly Teaching Schedule
        </h5>
        {syllabus.weekly_plans?.length > 0 ? (
          <div className="overflow-x-auto border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                  <th className="px-4 py-3 w-16">Week</th>
                  <th className="px-4 py-3">Topic / Subject Matter</th>
                  <th className="px-4 py-3">Classroom Activities</th>
                  <th className="px-4 py-3">Assessments</th>
                  <th className="px-4 py-3">References / Materials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {syllabus.weekly_plans.map((plan, i) => (
                  <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#800000] text-center bg-red-50/10">W{plan.week}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{plan.topic}</td>
                    <td className="px-4 py-3">{plan.activities || "—"}</td>
                    <td className="px-4 py-3">{plan.assessments || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 italic">{plan.materials || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic pl-3">No schedule specified.</p>
        )}
      </div>

      {/* 3. Grading Components */}
      <div className="space-y-3">
        <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
          3. Classroom Grading Criteria
        </h5>
        {syllabus.grading_components?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                    <th className="px-4 py-2.5">Grading Component</th>
                    <th className="px-4 py-2.5 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {syllabus.grading_components.map((gc, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold">{gc.name}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#800000]">{gc.percentage}%</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50/10 font-bold text-gray-900 border-t border-gray-200">
                    <td className="px-4 py-3">Total Cumulative Weight</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-red-900">
                      {syllabus.grading_components.reduce((sum, curr) => sum + curr.percentage, 0)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 flex flex-col justify-center bg-white/40">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PUP Grading Standard</span>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                The minimum passing grade for undergraduate subjects is 75% or 3.0. Final assessments are computed strictly using the components described in the syllabus.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic pl-3">No grading components specified.</p>
        )}
      </div>
    </div>
  );
}

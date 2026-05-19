"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Eye, Edit2, Download, AlertCircle, FileText, CheckCircle, Clock, XCircle, File } from "lucide-react";

export function SyllabusList({ role, userId }) {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Modal State for Viewing
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailedSyllabus, setDetailedSyllabus] = useState(null);

  const fetchSyllabi = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);

      // If student, we only show approved syllabi
      if (role === "student") {
        params.set("status", "approved");
      } else if (role === "instructor") {
        // Instructor only views their own syllabi
        params.set("instructorId", userId);
      }

      const res = await fetch(`/api/syllabi?${params.toString()}`);
      const data = await res.json();
      setSyllabi(data.syllabi || []);
    } catch (error) {
      console.error("Failed to fetch syllabi list:", error);
    }
    setLoading(false);
  }, [search, statusFilter, role, userId]);

  useEffect(() => {
    fetchSyllabi();
  }, [fetchSyllabi]);

  const viewSyllabusDetails = async (s) => {
    setSelectedSyllabus(s);
    setModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/syllabi/${s.id}`);
      const data = await res.json();
      setDetailedSyllabus(data.syllabus);
    } catch (e) {
      console.error("Failed to load detailed syllabus:", e);
    }
    setLoadingDetails(false);
  };

  const handlePrint = (syllabus) => {
    if (!syllabus) return;

    // Create printable document in a new window/iframe
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the syllabus.");
      return;
    }

    const outcomesHtml = syllabus.learning_outcomes?.map((o, idx) => `
      <div class="list-item">
        <span class="number">${idx + 1}.</span>
        <span>${o.description}</span>
      </div>
    `).join("") || "<p class='empty'>No outcomes specified.</p>";

    const plansHtml = syllabus.weekly_plans?.map(p => `
      <tr>
        <td class="week">Week ${p.week}</td>
        <td class="bold">${p.topic}</td>
        <td>${p.activities || "—"}</td>
        <td>${p.assessments || "—"}</td>
        <td>${p.materials || "—"}</td>
      </tr>
    `).join("") || "<tr><td colspan='5' class='empty'>No schedule specified.</td></tr>";

    const gradingHtml = syllabus.grading_components?.map(g => `
      <tr>
        <td class="bold">${g.name}</td>
        <td class="right">${g.percentage}%</td>
      </tr>
    `).join("") || "<tr><td colspan='2' class='empty'>No grading components.</td></tr>";

    const totalGrading = syllabus.grading_components?.reduce((sum, curr) => sum + curr.percentage, 0) || 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>${syllabus.code} Syllabus - PUP San Juan</title>
          <style>
            body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; padding: 40px; margin: 0; }
            .header-container { display: flex; align-items: center; border-bottom: 3px solid #800000; padding-bottom: 20px; margin-bottom: 30px; }
            .title-area { flex-grow: 1; }
            .pup-branding { color: #800000; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 0; letter-spacing: 1px; }
            .subtitle { color: #555; font-size: 14px; margin: 5px 0 0 0; font-weight: bold; }
            .course-title { font-size: 18px; font-weight: bold; color: #111; margin: 15px 0 5px 0; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .meta-table td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
            .meta-table td.label { font-weight: bold; background-color: #f9f9f9; width: 18%; }
            h2 { color: #800000; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #800000; padding-bottom: 5px; margin: 30px 0 15px 0; letter-spacing: 0.5px; }
            .list-item { display: flex; gap: 10px; margin-bottom: 10px; font-size: 13px; text-align: justify; }
            .number { font-weight: bold; color: #800000; }
            .schedule-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
            .schedule-table th, .schedule-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .schedule-table th { background-color: #f9f9f9; font-weight: bold; }
            .schedule-table td.week { font-weight: bold; color: #800000; width: 8%; text-align: center; }
            .grading-table { width: 50%; border-collapse: collapse; font-size: 13px; }
            .grading-table th, .grading-table td { border: 1px solid #ddd; padding: 8px 12px; }
            .grading-table th { background-color: #f9f9f9; font-weight: bold; }
            .grading-table td.right { text-align: right; font-weight: bold; }
            .bold { font-weight: bold; color: #111; }
            .empty { color: #999; font-style: italic; }
            .footer { margin-top: 50px; font-size: 11px; text-align: center; color: #888; border-top: 1px dashed #ccc; padding-top: 15px; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="title-area">
              <h1 class="pup-branding">Polytechnic University of the Philippines</h1>
              <p class="subtitle">San Juan Branch • Academic Syllabus Management Portal</p>
              <h2 class="course-title">${syllabus.code}: ${syllabus.title}</h2>
            </div>
          </div>

          <table class="meta-table">
            <tr>
              <td class="label">Course Code</td>
              <td>${syllabus.code}</td>
              <td class="label">Course Units</td>
              <td>${syllabus.units} Units</td>
            </tr>
            <tr>
              <td class="label">Instructor</td>
              <td>${syllabus.instructor_name || "Unassigned"}</td>
              <td class="label">Email Contact</td>
              <td>${syllabus.instructor_email || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Syllabus Status</td>
              <td>Approved (Version ${syllabus.version})</td>
              <td class="label">Last Updated</td>
              <td>${new Date(syllabus.updated_at).toLocaleDateString()}</td>
            </tr>
          </table>

          <h2>1. Course Learning Outcomes</h2>
          <div style="padding-left: 10px;">
            ${outcomesHtml}
          </div>

          <h2>2. Weekly Schedule</h2>
          <table class="schedule-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Topic / Subject Matter</th>
                <th>Classroom Activities</th>
                <th>Assessments</th>
                <th>References / Materials</th>
              </tr>
            </thead>
            <tbody>
              ${plansHtml}
            </tbody>
          </table>

          <h2>3. Grading Criteria</h2>
          <table class="grading-table">
            <thead>
              <tr>
                <th>Evaluation Component</th>
                <th style="text-align: right; width: 30%;">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${gradingHtml}
              <tr style="font-weight: bold; background-color: #f9f9f9;">
                <td>Total Weight</td>
                <td style="text-align: right; color: #800000;">${totalGrading}%</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} • PUP San Juan Branch Official Syllabus Portal. 
            All rights reserved.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Status Badge helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-1 w-fit">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case "submitted":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1 w-fit animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Submitted</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" />
            <span>Changes Required</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg flex items-center gap-1 w-fit">
            <File className="w-3.5 h-3.5" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls: Search and Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search syllabi by course code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
          />
        </div>

        {/* Filters */}
        {role !== "student" && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Changes Required</option>
            </select>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-red-800 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-500">Loading syllabus list...</span>
          </div>
        ) : syllabi.length > 0 ? (
          (() => {
            const totalPages = Math.ceil(syllabi.length / 10);
            const paginatedSyllabi = syllabi.slice((currentPage - 1) * 10, currentPage * 10);
            return (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <th className="px-6 py-4">Course</th>
                        {role === "admin" && <th className="px-6 py-4">Instructor</th>}
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Version</th>
                        <th className="px-6 py-4 text-center">Last Updated</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedSyllabi.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-red-900 block">{item.code}</span>
                            <span className="text-xs font-medium text-gray-700 block mt-0.5">{item.course_title}</span>
                          </td>
                          {role === "admin" && (
                            <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                              {item.instructor_name || "Unassigned"}
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              {getStatusBadge(item.status)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-extrabold text-gray-700">v{item.version}</span>
                          </td>
                          <td className="px-6 py-4 text-center text-xs font-medium text-gray-400">
                            {new Date(item.updated_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              {/* Actions based on role and status */}
                              <button
                                onClick={() => viewSyllabusDetails(item)}
                                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>

                              {/* Edit for draft or rejected (only for instructor) */}
                              {role === "instructor" && (item.status === "draft" || item.status === "rejected") && (
                                <Link
                                  href={`/instructor/syllabi/${item.id}/edit`}
                                  className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-700 hover:text-red-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-500">
                      Showing <span className="text-gray-900 font-bold">{Math.min(syllabi.length, (currentPage - 1) * 10 + 1)}</span> to{" "}
                      <span className="text-gray-900 font-bold">{Math.min(syllabi.length, currentPage * 10)}</span> of{" "}
                      <span className="text-gray-900 font-bold">{syllabi.length}</span> items
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? "bg-[#800000] text-white shadow-sm"
                              : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()
        ) : (
          <div className="py-20 text-center max-w-sm mx-auto flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-red-50 text-[#800000] rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-gray-900">No syllabi found</h4>
            <p className="text-xs text-gray-400 font-medium">
              We couldn't find any syllabi matching your criteria. Try adjusting your search query or status filter.
            </p>
          </div>
        )}
      </div>

      {/* --- DETAIL MODAL --- */}
      {modalOpen && selectedSyllabus && (
        <div className="fixed inset-0 bg-black/60 z-45 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#800000] text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Syllabus Directory</span>
                <h3 className="font-extrabold text-base">{selectedSyllabus.code} - {selectedSyllabus.course_title}</h3>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setDetailedSyllabus(null);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable details view */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
              {loadingDetails ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-3 border-[#800000] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-gray-500">Loading syllabus content details...</span>
                </div>
              ) : detailedSyllabus ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-8 shadow-sm">

                  {/* Status Banner */}
                  {detailedSyllabus.status === "rejected" && detailedSyllabus.approval_comment && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-800">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                      <div className="text-xs font-medium">
                        <strong className="block font-bold">Changes Required by Administrator:</strong>
                        <p className="mt-1 leading-relaxed">{detailedSyllabus.approval_comment}</p>
                      </div>
                    </div>
                  )}

                  {detailedSyllabus.status === "approved" && detailedSyllabus.approval_comment && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 text-green-800">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600 mt-0.5" />
                      <div className="text-xs font-medium">
                        <strong className="block font-bold">Administrative Review Comments:</strong>
                        <p className="mt-1 leading-relaxed">{detailedSyllabus.approval_comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Info Header */}
                  <div className="border-b border-gray-100 pb-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-red-800 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">Course Info</span>
                      <h4 className="text-lg font-bold text-gray-900 mt-2">{detailedSyllabus.code} - {detailedSyllabus.title}</h4>
                      <span className="text-xs font-medium text-gray-500 mt-1 block">Units: <strong>{detailedSyllabus.units} Units</strong></span>
                    </div>
                    <div className="text-left sm:text-right text-xs">
                      <span className="text-gray-400 block uppercase font-bold">Instructor In-Charge</span>
                      <span className="text-gray-700 block font-extrabold mt-1">{detailedSyllabus.instructor_name || "Unassigned"}</span>
                      <span className="text-gray-400 block font-semibold mt-0.5">{detailedSyllabus.instructor_email || "N/A"}</span>
                    </div>
                  </div>

                  {/* 1. Outcomes */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
                      1. Course Learning Outcomes
                    </h5>
                    {detailedSyllabus.learning_outcomes?.length > 0 ? (
                      <ol className="divide-y divide-gray-100 text-xs text-gray-600 bg-gray-50/50 rounded-xl border border-gray-100 overflow-hidden">
                        {detailedSyllabus.learning_outcomes.map((item, i) => (
                          <li key={i} className="px-4 py-2.5 flex gap-2 leading-relaxed">
                            <span className="font-bold text-[#800000]">{i + 1}.</span>
                            <span>{item.description}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs text-gray-400 italic pl-3">No outcomes specified.</p>
                    )}
                  </div>

                  {/* 2. Weekly schedule */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
                      2. Weekly Teaching Schedule
                    </h5>
                    {detailedSyllabus.weekly_plans?.length > 0 ? (
                      <div className="overflow-x-auto border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-white">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                              <th className="px-3 py-2 w-16">Week</th>
                              <th className="px-3 py-2">Topic / Subject Matter</th>
                              <th className="px-3 py-2">Activities</th>
                              <th className="px-3 py-2">Assessments</th>
                              <th className="px-3 py-2">Materials / References</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-600">
                            {detailedSyllabus.weekly_plans.map((p, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2.5 font-bold text-[#800000] text-center bg-red-50/10">W{p.week}</td>
                                <td className="px-3 py-2.5 font-semibold text-gray-900">{p.topic}</td>
                                <td className="px-3 py-2.5">{p.activities || "—"}</td>
                                <td className="px-3 py-2.5">{p.assessments || "—"}</td>
                                <td className="px-3 py-2.5 text-gray-500 italic">{p.materials || "—"}</td>
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
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-gray-800 border-l-3 border-[#800000] pl-2.5">
                      3. Classroom Grading Criteria
                    </h5>
                    {detailedSyllabus.grading_components?.length > 0 ? (
                      <div className="border border-gray-100 rounded-xl overflow-hidden max-w-md bg-gray-50/30">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                              <th className="px-4 py-2.5">Grading Component</th>
                              <th className="px-4 py-2.5 text-right">Percentage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-600">
                            {detailedSyllabus.grading_components.map((g, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2.5 font-semibold">{g.name}</td>
                                <td className="px-4 py-2.5 text-right font-extrabold text-[#800000]">{g.percentage}%</td>
                              </tr>
                            ))}
                            <tr className="bg-red-50/10 font-bold text-gray-900 border-t border-gray-200">
                              <td className="px-4 py-2.5">Total Cumulative Weight</td>
                              <td className="px-4 py-2.5 text-right text-sm font-black text-red-900">
                                {detailedSyllabus.grading_components.reduce((sum, curr) => sum + curr.percentage, 0)}%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic pl-3">No grading components specified.</p>
                    )}
                  </div>

                </div>
              ) : (
                <div className="py-12 text-center text-xs text-red-500 font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed loading detailed data.</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="text-xs font-semibold text-gray-500">Syllabus Status: <strong className="text-gray-800 capitalize">{selectedSyllabus.status}</strong></span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setDetailedSyllabus(null);
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl transition-all"
                >
                  Close Directory Details
                </button>
                {detailedSyllabus && detailedSyllabus.status === "approved" && (
                  <button
                    onClick={() => handlePrint(detailedSyllabus)}
                    className="px-4 py-2 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow shadow-red-800/10 flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF / Print</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

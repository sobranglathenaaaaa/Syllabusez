"use client";

import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { groupCoursesByYearSemester, sortSemesters } from "@/lib/curriculum-layout";

function stripCodeFromTitle(title, code) {
  if (!title || !code) return title || "";
  let cleaned = String(title).trim();
  const esc = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  cleaned = cleaned.replace(new RegExp(`^${esc}[\\s\\-:\\u2013\\u2014]*`, "i"), "").trim();
  cleaned = cleaned.replace(/^[A-Z]{2,8}[\s-]?[A-Z0-9]*\s*\d{1,4}[A-Z]?[\s\-:\u2013\u2014]+/i, "").trim();
  return cleaned || title;
}

function buildCurriculumHTML(programName, courses) {
  const { grouped, sortedYears } = groupCoursesByYearSemester(courses);

  const electives = courses.filter(
    (c) => String(c.title).includes("(Elective)") || /^ELECTIVE/i.test(c.code)
  );

  const buildTable = (coursesList, label) => {
    const total = coursesList.reduce((s, c) => s + (c.units || 0), 0);
    const rows = coursesList
      .map(
        (c) => `
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:8px 10px;font-weight:700;color:#111827;white-space:nowrap;">${c.code}</td>
          <td style="padding:8px 10px;color:#1f2937;font-weight:600;">${stripCodeFromTitle(c.title, c.code)}</td>
          <td style="padding:8px 6px;text-align:center;font-weight:700;">${c.lecture_hours ?? c.lectureHours ?? 0}</td>
          <td style="padding:8px 6px;text-align:center;font-weight:700;">${c.lab_hours ?? c.labHours ?? 0}</td>
          <td style="padding:8px 6px;text-align:center;font-weight:700;color:#800000;">${c.units}</td>
          <td style="padding:8px 10px;font-size:11px;color:#6b7280;">${c.prereq || c.coreq ? [c.prereq && `Pre: ${c.prereq}`, c.coreq && `Co: ${c.coreq}`].filter(Boolean).join(" | ") : "—"}</td>
        </tr>`
      )
      .join("");

    return `
      <div style="margin-bottom:24px;">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#f3f4f6;padding:10px 14px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:13px;color:#111827;">${label}</strong>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:Arial,sans-serif;">
            <thead>
              <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                <th style="padding:8px 10px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;width:80px;">Code</th>
                <th style="padding:8px 10px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;">Title</th>
                <th style="padding:8px 6px;text-align:center;font-size:10px;color:#6b7280;text-transform:uppercase;width:40px;">Lec</th>
                <th style="padding:8px 6px;text-align:center;font-size:10px;color:#6b7280;text-transform:uppercase;width:40px;">Lab</th>
                <th style="padding:8px 6px;text-align:center;font-size:10px;color:#6b7280;text-transform:uppercase;width:50px;">Units</th>
                <th style="padding:8px 10px;text-align:left;font-size:10px;color:#6b7280;text-transform:uppercase;width:140px;">Pre/Co-req</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr style="background:#fef2f2;border-top:2px solid #e5e7eb;">
                <td colspan="4" style="padding:8px 10px;text-align:right;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;">Semester Total:</td>
                <td style="padding:8px 6px;text-align:center;font-weight:900;color:#800000;font-size:14px;">${total}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  };

  let yearSections = "";
  for (const year of sortedYears) {
    const semesters = sortSemesters(Object.keys(grouped[year]));
    let semesterBlocks = "";
    for (const sem of semesters) {
      const list = grouped[year][sem].filter((c) => !String(c.title).includes("(Elective)"));
      if (list.length === 0) continue;
      semesterBlocks += buildTable(list, sem);
    }
    yearSections += `
      <div style="margin-bottom:32px;">
        <h2 style="font-size:16px;font-weight:900;color:#111827;text-transform:uppercase;letter-spacing:2px;border-bottom:3px solid #800000;padding-bottom:8px;margin-bottom:16px;">${year}</h2>
        ${semesterBlocks}
      </div>`;
  }

  const electivesSection =
    electives.length > 0
      ? `
      <div style="margin-top:32px;">
        <h3 style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#800000;background:#fef2f2;border-left:4px solid #800000;padding:8px 12px;border-radius:0 6px 6px 0;margin-bottom:12px;">Elective Courses</h3>
        ${buildTable(
          electives.map((c) => ({ ...c, title: c.title.replace(" (Elective)", "") })),
          "Electives"
        )}
      </div>`
      : "";

  return `
    <div style="font-family:Arial,sans-serif;background:white;padding:40px;max-width:900px;margin:0 auto;">
      <div style="border-bottom:3px solid #800000;padding-bottom:20px;margin-bottom:32px;">
        <p style="font-size:10px;font-weight:700;color:#800000;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">Official Dynamic Curriculum</p>
        <h1 style="font-size:24px;font-weight:900;color:#111827;margin:0;">${programName || "Program Curriculum"}</h1>
      </div>
      ${yearSections}
      ${electivesSection}
    </div>`;
}

export default function DownloadCurriculumButton({ programName, programId, fileName, courses, asIcon = false }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!courses || courses.length === 0) {
      alert("No curriculum content available to download.");
      return;
    }

    setDownloading(true);

    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const pdfFileName = `${programName ? programName + " - " : ""}Curriculum.pdf`;
      const opt = {
        margin: 10,
        filename: pdfFileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Build fully inline-styled HTML so Tailwind is NOT needed
      const html = buildCurriculumHTML(programName, courses);

      // Pass the raw HTML string directly to html2pdf. 
      // It handles background rendering without needing DOM manipulation or scroll hacks.
      await html2pdf().set(opt).from(html).save();

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert(`Failed to generate PDF. Error: ${error?.message || error}`);
    } finally {
      setDownloading(false);
    }
  };

  if (asIcon) {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-3 py-1.5 border border-[#e5e7eb] hover:bg-[#f3f4f6] text-[#374151] font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        title="Download Dynamic View"
      >
        {downloading ? (
          <div className="w-3 h-3 border-2 border-[#6b7280] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-3 h-3 rotate-180" />
        )}
        <span>{downloading ? "Wait..." : "Download"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 bg-[#800000] hover:bg-[#600000] disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
    >
      {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      <span>{downloading ? "Generating PDF..." : "Download Curriculum"}</span>
    </button>
  );
}

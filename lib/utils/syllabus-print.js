/**
 * Shared utility to download the syllabus in a professional "dynamic view" format
 * using html2pdf.js with fully inline-styled HTML (no Tailwind dependency).
 */
export async function printSyllabus(syllabus) {
  if (!syllabus) return;

  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const outcomes = syllabus.course_outcomes?.length > 0
      ? syllabus.course_outcomes
      : (syllabus.learning_outcomes || []);

    const outcomesHtml = outcomes.length > 0
      ? `<ol style="margin:0;padding:0;list-style:none;">${outcomes.map((item, i) => `
          <li style="padding:10px 16px;border-bottom:1px solid #f3f4f6;display:flex;gap:12px;font-size:13px;color:#374151;">
            <span style="font-weight:700;color:#800000;min-width:20px;">${i + 1}.</span>
            <span>${item.description || ""}</span>
          </li>`).join("")}</ol>`
      : `<p style="color:#9ca3af;font-style:italic;padding:8px 16px;font-size:13px;">No outcomes specified.</p>`;

    const weeklyHtml = syllabus.weekly_plans?.length > 0
      ? `<table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
              <th style="padding:10px;text-align:left;width:50px;color:#6b7280;font-size:10px;text-transform:uppercase;">Week</th>
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase;">Topic / Subject Matter</th>
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase;">Activities</th>
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase;">Assessments</th>
            </tr>
          </thead>
          <tbody>
            ${syllabus.weekly_plans.map((p, i) => `
              <tr style="border-bottom:1px solid #f3f4f6;background:${i % 2 === 0 ? '#ffffff' : '#fafafa'};">
                <td style="padding:8px 10px;font-weight:900;color:#800000;text-align:center;">W${p.week}</td>
                <td style="padding:8px 10px;font-weight:600;color:#111827;">${p.topic || "—"}</td>
                <td style="padding:8px 10px;color:#4b5563;">${p.activities || "—"}</td>
                <td style="padding:8px 10px;color:#4b5563;">${p.assessments || "—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>`
      : `<p style="color:#9ca3af;font-style:italic;padding:8px 0;font-size:13px;">No schedule specified.</p>`;

    const totalPct = (syllabus.grading_components || []).reduce((s, g) => s + (g.percentage || 0), 0);
    const gradingHtml = syllabus.grading_components?.length > 0
      ? `<table style="width:100%;border-collapse:collapse;font-size:12px;max-width:400px;">
          <thead>
            <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:10px;text-transform:uppercase;">Component</th>
              <th style="padding:10px;text-align:right;color:#6b7280;font-size:10px;text-transform:uppercase;">Weight</th>
            </tr>
          </thead>
          <tbody>
            ${syllabus.grading_components.map(g => `
              <tr style="border-bottom:1px solid #f3f4f6;">
                <td style="padding:8px 10px;color:#374151;font-weight:600;">${g.name}</td>
                <td style="padding:8px 10px;text-align:right;font-weight:800;color:#800000;">${g.percentage}%</td>
              </tr>`).join("")}
            <tr style="background:#fef2f2;border-top:2px solid #e5e7eb;">
              <td style="padding:10px;font-weight:700;color:#374151;">Total</td>
              <td style="padding:10px;text-align:right;font-weight:900;font-size:15px;color:#7f1d1d;">${totalPct}%</td>
            </tr>
          </tbody>
        </table>`
      : `<p style="color:#9ca3af;font-style:italic;padding:8px 0;font-size:13px;">No grading components specified.</p>`;

    const html = `
      <div style="font-family:Arial,sans-serif;background:white;padding:40px;max-width:850px;margin:0 auto;">
        <!-- Header -->
        <div style="border-bottom:3px solid #800000;padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <span style="font-size:9px;font-weight:700;color:#800000;text-transform:uppercase;letter-spacing:3px;background:#fef2f2;padding:3px 8px;border-radius:4px;">Course Info</span>
            <h1 style="font-size:22px;font-weight:900;color:#111827;margin:10px 0 6px;">${syllabus.code || ""} — ${syllabus.title || ""}</h1>
            <p style="font-size:13px;color:#6b7280;margin:0;">Units: <strong>${syllabus.units || 0} Units</strong></p>
          </div>
          <div style="text-align:right;">
            <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin:0 0 4px;">Instructor In-Charge</p>
            <p style="font-size:14px;font-weight:800;color:#374151;margin:0;">${syllabus.instructor_name || "Unassigned"}</p>
            <p style="font-size:11px;color:#9ca3af;margin:4px 0 0;">${syllabus.instructor_email || "N/A"}</p>
          </div>
        </div>

        <!-- Section 1: Outcomes -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#1f2937;border-left:4px solid #800000;padding-left:12px;margin:0 0 12px;">1. Course Learning Outcomes</h2>
          <div style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;background:#fafafa;">
            ${outcomesHtml}
          </div>
        </div>

        <!-- Section 2: Weekly Schedule -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#1f2937;border-left:4px solid #800000;padding-left:12px;margin:0 0 12px;">2. Weekly Teaching Schedule</h2>
          <div style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;background:#fafafa;">
            ${weeklyHtml}
          </div>
        </div>

        <!-- Section 3: Grading -->
        <div style="margin-bottom:30px;">
          <h2 style="font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#1f2937;border-left:4px solid #800000;padding-left:12px;margin:0 0 12px;">3. Classroom Grading Criteria</h2>
          <div style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden;background:#fafafa;">
            ${gradingHtml}
          </div>
          <div style="margin-top:12px;padding:12px 16px;background:#f9fafb;border:1px dashed #e5e7eb;border-radius:8px;">
            <p style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin:0 0 4px;">PUP Grading Standard</p>
            <p style="font-size:11px;color:#6b7280;margin:0;line-height:1.6;">The minimum passing grade for undergraduate subjects is 75% or 3.0. Final assessments are computed strictly using the components described in the syllabus.</p>
          </div>
        </div>
      </div>`;

    const mask = document.createElement('div');
    mask.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0.6;z-index:99998;display:flex;align-items:center;justify-content:center;';
    mask.innerHTML = '<span style="color:white;font-family:Arial;font-size:14px;font-weight:700;">Generating PDF…</span>';
    document.body.appendChild(mask);

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:900px;background:white;z-index:99999;overflow:auto;max-height:100vh;';
    container.innerHTML = html;
    document.body.appendChild(container);

    const fileName = `${syllabus.code || 'Course'}_Syllabus.pdf`;
    const opt = {
      margin: 0,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await new Promise(r => setTimeout(r, 300));
    await html2pdf().set(opt).from(container).save();

    document.body.removeChild(container);
    document.body.removeChild(mask);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    alert(`Failed to generate PDF. Error: ${error?.message || error}`);
  }
}

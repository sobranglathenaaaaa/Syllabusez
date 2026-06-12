import puplogo from "@/lib/image/puplogo.png";

const defaultCampusGoals = [
  "Provide high quality instruction that is responsive to the needs of the industry and the society.",
  "Conduct relevant research that contributes to the body of knowledge and supports community development.",
  "Engage in extension activities that empower the marginalized sectors of the society.",
  "Maintain a high level of professionalism and integrity in all university operations."
];

/**
 * Shared utility to download/print the syllabus in a professional, landscape PDF format.
 * Generates the Outcomes-Based Course Syllabus table-boxed format exactly as requested.
 */


export function printSyllabus(syllabus) {
  if (!syllabus) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download/print the syllabus.");
    return;
  }


  // Format ILOs List
  const iloList = (syllabus.institutional_outcomes && syllabus.institutional_outcomes.length > 0) ? syllabus.institutional_outcomes : [];

  const iloHtml = iloList.map((ilo, idx) => {
      const name = typeof ilo === "object" ? ilo.name : ilo;
      const desc = typeof ilo === "object" ? ilo.meaning || ilo.description : "";
      return `
      <div style="margin-bottom: 8px; font-size: 11px;">
        <strong>${idx + 1}. ${name}</strong>. ${desc}
      </div>
    `;
    }).join("");

  // Format Campus Goals List
  const campusGoalsList = syllabus.campus_goals && syllabus.campus_goals.length > 0
    ? syllabus.campus_goals
    : defaultCampusGoals;

  const campusGoalsHtml = `
    <div style="font-size: 11px; margin-bottom: 5px;">The PUP San Juan Branch aims to achieve the following goals:</div>
    ${campusGoalsList.map((g, idx) => `
      <div style="margin-left: 10px; font-size: 11px; margin-bottom: 3px;">
        ${idx + 1}. ${g}
      </div>
    `).join("")}
  `;

  // Helper function to check alignment between PLO and ILO
  const isAligned = (plo, index, iloName) => {
    if (!plo.alignments) return false;
    return plo.alignments.some(align => {
      if (typeof align === 'string') {
        const lowerAlign = align.toLowerCase().trim();
        return lowerAlign.includes(iloName.toLowerCase().trim()) ||
          lowerAlign.includes(`ilo-${index}`) ||
          lowerAlign === String(index) ||
          (iloName && lowerAlign === iloName.toLowerCase().trim());
      }
      return false;
    });
  };

  // Format PLO Table Rows with alignment checks
  const ploRowsHtml = syllabus.program_outcomes?.map((plo, idx) => {
    const checksHtml = iloList.map((ilo, iloIdx) => {
      const name = typeof ilo === "object" ? ilo.name : ilo;
      const aligned = isAligned(plo, iloIdx + 1, name);
      return `<td class="center font-bold">${aligned ? "✓" : ""}</td>`;
    }).join("");

    return `
      <tr>
        <td class="left-align" style="font-size: 11px; padding: 6px 8px;">
          ${idx + 1}) ${plo.description}
        </td>
        ${checksHtml}
      </tr>
    `;
  }).join("") || `
    <tr>
      <td colspan="${iloList.length + 1}" class="center italic" style="padding: 10px;">No Program Learning Outcomes specified.</td>
    </tr>
  `;

  // Helper function to check alignment between item and PLO
  const isPloAligned = (item, ploId) => {
    if (!item.alignments) return false;
    return item.alignments.includes(ploId);
  };

  const ploList = syllabus.program_outcomes || [];
  const ploHeadersHtml = ploList.map((plo, idx) => `<th style="width: 3.5%;" title="${plo.description || ''}">${idx + 1}</th>`).join("") || Array.from({ length: 9 }).map((_, i) => `<th style="width: 3.5%;">${i + 1}</th>`).join("");
  const ploColspan = ploList.length || 9;

  // Format Performance Indicators (PI) Table Rows
  const piRowsHtml = syllabus.performance_indicators?.map((pi, idx) => {
    const checksHtml = ploList.map((plo) => {
      const aligned = isPloAligned(pi, plo.id);
      return `<td class="center font-bold">${aligned ? "✓" : ""}</td>`;
    }).join("") || Array.from({ length: 9 }).map(() => `<td class="center font-bold"></td>`).join("");

    return `
      <tr>
        <td class="left-align" style="font-size: 11px; padding: 6px 8px;">
          <ul><li style="margin: 0; text-align: justify;">${pi.description || "No description"}</li></ul>
        </td>
        ${checksHtml}
      </tr>
    `;
  }).join("") || `
    <tr>
      <td colspan="${ploColspan + 1}" class="center italic" style="padding: 10px;">No Performance Indicators specified.</td>
    </tr>
  `;

  // Format Course Learning Outcomes (CLO) Table Rows
  const cloList = syllabus.course_outcomes?.length > 0 ? syllabus.course_outcomes : syllabus.learning_outcomes;
  const cloRowsHtml = cloList?.map((clo, idx) => {
    const checksHtml = ploList.map((plo) => {
      const aligned = isPloAligned(clo, plo.id);
      return `<td class="center font-bold">${aligned ? "✓" : ""}</td>`;
    }).join("") || Array.from({ length: 9 }).map(() => `<td class="center font-bold"></td>`).join("");

    return `
      <tr>
        <td class="left-align" style="font-size: 11px; padding: 6px 8px;">
          ${idx + 1}. ${clo.description || "No description"}
        </td>
        ${checksHtml}
      </tr>
    `;
  }).join("") || `
    <tr>
      <td colspan="${ploColspan + 1}" class="center italic" style="padding: 10px;">No Course Learning Outcomes specified.</td>
    </tr>
  `;

  const cloColspan = cloList?.length || 5;
  const cloHeadersHtml = cloList?.map((clo, idx) => `<th rowspan="2" style="text-align: center; vertical-align: middle; width: 3.5%;" title="${clo.description || ''}">${idx + 1}</th>`).join("") || Array.from({ length: 5 }).map((_, i) => `<th rowspan="2" style="text-align: center; vertical-align: middle; width: 3.5%;">${i + 1}</th>`).join("");

  const plansHtml = syllabus.weekly_plans?.map(p => {
    const checksHtml = cloList?.map(clo => {
      const aligned = Array.isArray(p.clo_alignment)
        ? p.clo_alignment.includes(clo.id)
        : typeof p.clo_alignment === 'string' && p.clo_alignment.includes(clo.id);
      return `<td class="center font-bold">${aligned ? "✓" : ""}</td>`;
    }).join("") || Array.from({ length: 5 }).map(() => `<td class="center font-bold"></td>`).join("");

    return `
      <tr>
        <td class="week-cell center">Week ${p.week}</td>
        <td>${p.desired_learning_outcomes || "—"}</td>
        <td class="bold">${p.topic || "—"}</td>
        <td>${p.activities || "—"}</td>
        <td>—</td>
        <td>—</td>
        <td>${p.assessments || "—"}</td>
        ${checksHtml}
      </tr>
    `;
  }).join("") || `<tr><td colspan="${7 + cloColspan}" class='empty center'>No OBTL plan specified.</td></tr>`;

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
        <title>${syllabus.code} Outcomes-Based Syllabus - PUP San Juan</title>
                <style>
          @page {
            size: landscape;
            margin: 10mm 15mm;
            @bottom-center { content: counter(page) " of " counter(pages); }
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #111;
            line-height: 1.4;
            padding: 0;
            margin: 0;
            background: #fff;
          }

          /* Title with logo */
          .logo-container {
            text-align: center;
            margin-bottom: 5px;
          }
          .logo {
            height: 30px;
          }

          .syllabus-main-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
            color: #004080;
          }

          /* Main Boxed Layout */
          .boxed-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .boxed-table td, .boxed-table th {
            border: 1px solid #000;
            padding: 8px 10px;
            vertical-align: middle;
            font-size: 12px;
          }

          .section-header {
            background-color: #f0f4f8;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .side-label {
            background-color: #f0f4f8;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            width: 20%;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .bold { font-weight: bold; }
          .center { text-align: center; }
          .left-align { text-align: left; }

          .alignment-table { width: 100%; border-collapse: collapse; margin: 0; }
          .alignment-table th, .alignment-table td { border: 1px solid #000; font-size: 11px; padding: 4px; }

          h2 {
            color: #800000;
            font-size: 12px;
            text-transform: uppercase;
            border-bottom: 2px solid #000;
            padding-bottom: 3px;
            margin: 20px 0 10px 0;
            letter-spacing: 0.5px;
            font-weight: bold;
          }
          .list-item { display: flex; gap: 10px; margin-bottom: 6px; font-size: 11px; text-align: justify; }
          .number { font-weight: bold; color: #800000; }
          .schedule-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px; }
          .schedule-table th, .schedule-table td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
          .schedule-table th { background-color: #f0f4f8; font-weight: bold; }
          .schedule-table td.week-cell { font-weight: bold; color: #800000; width: 8%; text-align: center; }
          .grading-table { width: 50%; border-collapse: collapse; font-size: 11px; }
          .grading-table th, .grading-table td { border: 1px solid #000; padding: 6px 8px; }
          .grading-table th { background-color: #f0f4f8; font-weight: bold; }
          .grading-table td.right { text-align: right; font-weight: bold; }
          .empty { color: #888; font-style: italic; }
          .footer { margin-top: 30px; font-size: 9px; text-align: center; color: #777; border-top: 1px dashed #ccc; padding-top: 10px; page-break-inside: avoid; }
          @media print { body { padding: 0; } button { display: none; } }
        </style>
      </head>
      <body>
        <div class="logo-container"><img src="${syllabus.logoUrl || '/logo.png'}" alt="Logo" class="logo"/></div>
<div class="syllabus-main-title">Outcomes-Based Course Syllabus</div>

        <!-- 1. COURSE INFORMATION SECTION TABLE -->
        <table class="boxed-table">
          <tr>
            <td colspan="6" class="section-header">Course Information</td>
          </tr>
          <tr>
            <td class="side-label" style="width: 12%;">Course Code</td>
            <td class="bold" style="width: 15%;">${syllabus.code}</td>
            <td class="side-label" style="width: 12%;">Course Title</td>
            <td class="bold">${syllabus.title}</td>
            <td class="side-label" style="width: 12%;">Course Credit</td>
            <td class="bold" style="width: 15%;">${syllabus.units} Units</td>
          </tr>
          <tr>
            <td class="side-label">Course Description</td>
            <td colspan="5" style="text-align: justify; font-size: 11px;">
              ${syllabus.course_description || "No course description provided."}
            </td>
          </tr>
          <tr>
            <td class="side-label">Pre-Requisite</td>
            <td colspan="2">${syllabus.prerequisites || "None"}</td>
            <td class="side-label">Co-Requisites</td>
            <td colspan="2">${syllabus.corequisites || "None"}</td>
          </tr>
        </table>

        <!-- 2. VISION, MISSION, QUALITY POLICY TABLE -->
        <table class="boxed-table">
          <tr>
            <td class="side-label">Vision</td>
            <td style="font-size: 11px;">${syllabus.vision || "PUP: The National Polytechnic University"}</td>
          </tr>
          <tr>
            <td class="side-label">Mission</td>
            <td style="font-size: 11px; text-align: justify;">
              ${(syllabus.mission || "").split('\n').map(line => `<div>${line}</div>`).join('')}
            </td>
          </tr>
          <tr>
            <td class="side-label">Quality Policy Statement</td>
            <td style="font-size: 11px; text-align: justify;">${syllabus.quality_policy || ""}</td>
          </tr>
        </table>

        <!-- 3. ILO AND CAMPUS GOALS TABLE -->
        <table class="boxed-table">
          <tr>
            <td class="side-label">Institutional Learning Outcomes (ILO)</td>
            <td style="text-align: justify;">
              ${iloHtml}
            </td>
          </tr>
          <tr>
            <td class="side-label">Campus Goals</td>
            <td>
              ${campusGoalsHtml}
            </td>
          </tr>
        </table>

        <!-- 4. PLO ALIGNMENT MATRIX TABLE -->
        <table class="boxed-table">
          <tr>
            <td class="side-label">Program Learning Outcomes (PLO)</td>
            <td style="padding: 0;">
              <table class="alignment-table">
                <thead>
                  <tr style="background-color: #f2f6fc;">
                    <th rowspan="2" style="text-align: left; padding: 6px 8px; width: 65%;">Program Learning Outcomes (PLO)</th>
                    <th colspan="${iloList.length}" class="center">Alignment to ILOs</th>
                  </tr>
                  <tr style="background-color: #f2f6fc;">
                    ${iloList.map((ilo, idx) => {
    const name = typeof ilo === "object" ? ilo.name : ilo;
    return `<th style="width: 3.5%;" title="${name}">${idx + 1}</th>`;
  }).join("")}
                  </tr>
                </thead>
                <tbody>
                  ${ploRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>
        </table>

        <!-- 5. PERFORMANCE INDICATORS (PI) AND CLO -->
        <table class="boxed-table">
          <tr>
            <td class="side-label">Performance Indicators (PI)</td>
            <td style="padding: 0;">
              <table class="alignment-table">
                <thead>
                  <tr style="background-color: #f2f6fc;">
                    <th rowspan="2" style="text-align: left; padding: 6px 8px; width: 65%;">Performance Indicators (PI)</th>
                    <th colspan="${ploColspan}" class="center">Alignment to PLOs</th>
                  </tr>
                  <tr style="background-color: #f2f6fc;">
                    ${ploHeadersHtml}
                  </tr>
                </thead>
                <tbody>
                  ${piRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td class="side-label">Course Learning Outcomes (CLO)</td>
            <td style="padding: 0;">
              <table class="alignment-table">
                <thead>
                  <tr style="background-color: #f2f6fc;">
                    <th rowspan="2" style="text-align: left; padding: 6px 8px; width: 65%;">Course Learning Outcomes (CLO)</th>
                    <th colspan="${ploColspan}" class="center">Alignment to PLOs</th>
                  </tr>
                  <tr style="background-color: #f2f6fc;">
                    ${ploHeadersHtml}
                  </tr>
                </thead>
                <tbody>
                  ${cloRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>
        </table>

        <!-- 6. WEEKLY TEACHING SCHEDULE (OBTL) -->
        <h2>OBTL Weekly Instructional Calendar</h2>
        <table class="schedule-table">
          <thead>
            <tr style="background-color: #f2f6fc;">
              <th rowspan="3" style="text-align: center; vertical-align: middle;">Week</th>
              <th rowspan="3" style="text-align: center; vertical-align: middle;">Desired Learning Outcomes (DLOs)</th>
              <th rowspan="3" style="text-align: center; vertical-align: middle;">Learning Content / Topics</th>
              <th colspan="3" class="center">Instructional Delivery Design</th>
              <th rowspan="3" style="text-align: center; vertical-align: middle;">Assessment</th>
              <th colspan="${cloColspan}" class="center">Alignment to CLOs</th>
            </tr>
            <tr style="background-color: #f2f6fc;">
              <th rowspan="2" style="text-align: center; vertical-align: middle;">Face-to-face</th>
              <th colspan="2" class="center">Flexible Learning and Teaching Activities (FLTAs)</th>
              ${cloHeadersHtml}
            </tr>
            <tr style="background-color: #f2f6fc;">
              <th style="text-align: center;">Synchronous</th>
              <th style="text-align: center;">Asynchronous</th>
            </tr>
          </thead>
          <tbody>
            ${plansHtml}
          </tbody>
        </table>

        <!-- 7. GRADING CRITERIA -->
        <h2>Grading Criteria</h2>
        <table class="grading-table">
          <thead>
            <tr>
              <th>Evaluation Component</th>
              <th style="text-align: right; width: 30%;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${gradingHtml}
            <tr style="font-weight: bold; background-color: #f2f6fc;">
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
}

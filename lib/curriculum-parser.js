// lib/curriculum-parser.js
// Written for PUP BSIT Curriculum Sheet DOCX format:
//   - Two semester tables side-by-side per year
//   - 6 columns per semester: Code | Title | Lec Hrs | Lab Hrs | Total Units | Pre-req
//   - Course codes with spaces: "GEED 032", "PATHFit 1", "INTE-FE 1", "COMP 001"
//   - Headings like: "FIRST YEAR – 1st Semester  FIRST YEAR – 2nd Semester"

/** Detect year level number from a text chunk */
function detectYearLevel(text) {
  const t = (text || "").toUpperCase();
  if (/\bFIRST\s*YEAR\b|\b1ST\s*YEAR\b/.test(t)) return 1;
  if (/\bSECOND\s*YEAR\b|\b2ND\s*YEAR\b/.test(t)) return 2;
  if (/\bTHIRD\s*YEAR\b|\b3RD\s*YEAR\b/.test(t)) return 3;
  if (/\bFOURTH\s*YEAR\b|\b4TH\s*YEAR\b/.test(t)) return 4;
  return null;
}

/** Detect semester number from a text chunk */
function detectSemester(text) {
  // Normalize mammoth superscript spacing: "1 st" -> "1st", "2 nd" -> "2nd"
  const t = (text || "").replace(/\b(\d)\s+(st|nd|rd|th)\b/gi, '$1$2').toUpperCase();
  if (/SUMMER/.test(t)) return 3;
  if (/\b2ND\s*SEM|\bSECOND\s*SEM/.test(t)) return 2;
  if (/\b1ST\s*SEM|\bFIRST\s*SEM/.test(t)) return 1;
  return null;
}

/** True if a line is a year/semester heading */
function isHeadingLine(line) {
  // Normalize mammoth superscript spacing: "1 st" -> "1st", "2 ND" -> "2ND"
  const normalized = (line || "").replace(/\b(\d)\s+(st|nd|rd|th)\b/gi, '$1$2');
  return (
    /\b(FIRST|SECOND|THIRD|FOURTH|1ST|2ND|3RD|4TH)\s*YEAR\b/i.test(normalized) ||
    /\bSUMMER\s*(TERM|SEM(ESTER)?)?\b/i.test(normalized) ||
    /\b(1ST|2ND|FIRST|SECOND)\s*SEM(ESTER)?\b/i.test(normalized)
  );
}

/** True if the line is a column header row */
function isHeaderRow(line) {
  return /\b(COURSE\s*CODE|DESCRIPTIVE\s*TITLE|LECTURE\s*HOURS?|CREDIT\s*UNITS?|PRE[\s\-]?REQUISITE|NO\.\s*OF\s*LAB)\b/i.test(line);
}

/** True if the line is a totals row */
function isTotalRow(line) {
  return /^\s*Total\b/i.test(line) || /^\s*CURRICULUM\s*SHEET\b/i.test(line);
}

/**
 * Returns true if a string looks like a PUP curriculum course code.
 * Handles: "GEED 032", "PATHFit 1", "NSTP 001", "ACCO 014",
 *          "COMP 001", "INTE-FE 1", "INTE-FE2", "COMP007"
 */
function isCourseCode(str) {
  const s = (str || "").trim();
  if (/^Total/i.test(s)) return false;
  // Letters (with optional hyphen + more letters), then optional space, then 1-3 digits, optional trailing letter
  return /^[A-Za-z]{2,8}(?:-[A-Za-z]{1,4})?\s?\d{1,3}[A-Za-z]?$/.test(s);
}

function colsToCourse(cols, yearLevel, semester) {
  const code = (cols[0] || "").trim();
  const title = (cols[1] || "").trim();
  if (!isCourseCode(code)) return null;
  if (!title || title.length < 3) return null;

  let lectureHours = Number((cols[2] || "").trim()) || 0;
  let labHours = Number((cols[3] || "").trim()) || 0;
  let units = null;

  // Find total units: look for a standalone small number in cols 2-4
  for (let i = 2; i <= 4 && i < cols.length; i++) {
    if (/^\d{1,2}(\.\d)?$/.test((cols[i] || "").trim())) {
      units = Number(cols[i].trim());
    }
  }

  if (!units || isNaN(units) || units <= 0) {
    units = 3;
  }

  const prereqRaw = (cols[5] || "").trim();
  const prereq = /^none$/i.test(prereqRaw) || prereqRaw === "" ? null : prereqRaw;

  return {
    code: code.replace(/\s+/, " ").trim(),
    title: title.trim(),
    lectureHours,
    labHours,
    units,
    prereq,
    year_level: yearLevel,
    semester,
  };
}

/** Strip HTML tags from a text chunk and collapse spaces */
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Parses courses from HTML string (mammoth.convertToHtml output) */
function parseCoursesFromHtml(html) {
  const courses = [];
  let currentYear = null;
  let currentSem = null;

  // ── Step 1: Split HTML into segments at table boundaries ─────────────
  // We find all <table>...</table> blocks and text between them.
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  const segments = []; // { type: 'text'|'table', content }
  let lastIndex = 0;
  let tMatch;

  while ((tMatch = tableRegex.exec(html)) !== null) {
    // Text before this table
    if (tMatch.index > lastIndex) {
      segments.push({ type: "text", content: html.substring(lastIndex, tMatch.index) });
    }
    segments.push({ type: "table", content: tMatch[1] });
    lastIndex = tMatch.index + tMatch[0].length;
  }
  // Remaining text after last table
  if (lastIndex < html.length) {
    segments.push({ type: "text", content: html.substring(lastIndex) });
  }

  // ── Step 2: Process segments in order ───────────────────────────────
  for (const segment of segments) {
    if (segment.type === "text") {
      // Extract headings from non-table HTML content
      const text = stripHtml(segment.content);
      if (isHeadingLine(text)) {
        const y = detectYearLevel(text);
        const s = detectSemester(text);
        if (y !== null) currentYear = y;
        if (s !== null) currentSem = s;
      }
    } else {
      // ── Process table rows ────────────────────────────────────────
      const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let trMatch;
      while ((trMatch = trRegex.exec(segment.content)) !== null) {
        const rowContent = trMatch[1];

        // Match both <td> and <th> cells (mammoth often outputs all <th>)
        const cellRegex = /<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi;
        let cellMatch;
        const cells = [];
        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          cells.push(cellMatch[1]);
        }

        if (cells.length === 0) continue;

        const cleanCells = cells.map(c => stripHtml(c).trim());
        const rowText = cleanCells.join(" ");

        // Check for year/semester headings embedded in table rows
        if (isHeadingLine(rowText)) {
          const y = detectYearLevel(rowText);
          const s = detectSemester(rowText);
          if (y !== null) currentYear = y;
          if (s !== null) currentSem = s;
          continue;
        }

        if (isHeaderRow(rowText) || isTotalRow(rowText)) {
          continue;
        }

        if (cleanCells.length >= 7 && (cleanCells[0].toLowerCase().includes("elective") || /^\d+$/.test(cleanCells[0]))) {
          const code = cleanCells[1].trim();
          if (/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]+)?\s?\d{1,3}[A-Za-z]?$/.test(code)) {
            const title = cleanCells[2].trim() + " (Elective)";
            const termStr = cleanCells[3].toLowerCase();
            const lec = Number(cleanCells[4]) || 0;
            const lab = Number(cleanCells[5]) || 0;
            const units = Number(cleanCells[6]) || 0;

            let year = 1;
            if (termStr.includes("1") || termStr.includes("first")) year = 1;
            if (termStr.includes("2") || termStr.includes("second")) year = 2;
            if (termStr.includes("3") || termStr.includes("third")) year = 3;
            if (termStr.includes("4") || termStr.includes("fourth")) year = 4;
            
            let sem = 1;
            if (termStr.includes("1") && termStr.includes("sem")) sem = 1;
            if (termStr.includes("2") && termStr.includes("sem")) sem = 2;
            if (termStr.includes("summer")) sem = 3;

            courses.push({
              code,
              title,
              lectureHours: lec,
              labHours: lab,
              units,
              prereq: null,
              year_level: year,
              semester: sem
            });
            continue;
          }
        }

        // For side-by-side tables:
        // 13 cols = 6 (left sem) + 1 (empty separator) + 6 (right sem)
        // 12 cols = 6 (left sem) + 6 (right sem)
        if (cleanCells.length >= 10) {
          const leftCols = cleanCells.slice(0, 6);
          const leftCourse = colsToCourse(leftCols, currentYear, 1);
          if (leftCourse) {
            courses.push(leftCourse);
          }

          // Determine right-side offset: if col 7 is empty (separator), skip it
          let rightStart = 6;
          if (cleanCells.length >= 13 && cleanCells[6].trim() === "") {
            rightStart = 7;
          }
          const rightCols = cleanCells.slice(rightStart, rightStart + 6);
          const rightCourse = colsToCourse(rightCols, currentYear, 2);
          if (rightCourse) {
            courses.push(rightCourse);
          }
        } else if (cleanCells.length >= 6) {
          const course = colsToCourse(cleanCells.slice(0, 6), currentYear, currentSem || 1);
          if (course) {
            courses.push(course);
          }
        }
      }
    }
  }

  // Fallback: compare with regex parser to catch courses missed by table heuristics
  const strippedText = stripHtml(html);
  const regexCourses = parseCoursesWithRegex(strippedText);
  if (regexCourses.length > courses.length) {
    return regexCourses;
  }

  return courses;
}

/**
 * Main parser entry point.
 * Handles mammoth-extracted text from two-column PUP curriculum DOCX tables.
 *
 * @param {string} text Raw text or HTML from file extraction.
 * @returns {Array<Object>} Array of course objects.
 */
export function parseCoursesFromDocumentText(text) {
  if (!text) return [];

  // If HTML structure is detected, route to HTML parser
  if (/<table|<p|<div/i.test(text)) {
    return parseCoursesFromHtml(text);
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const courses = [];

  // State: track left (1st sem) and right (2nd sem) contexts independently
  let leftYear = null, leftSem = null;
  let rightYear = null, rightSem = null;
  let currentYear = null, currentSem = null;

  for (const line of lines) {
    if (isHeaderRow(line)) continue;
    if (isTotalRow(line)) continue;

    // ── Heading detection ────────────────────────────────────────────────────
    if (isHeadingLine(line)) {
      // May be tab-separated dual headings: "FIRST YEAR – 1st Semester\tFIRST YEAR – 2nd Semester"
      const parts = line.split(/\t+/);
      const leftPart = parts[0] || "";
      const rightPart = parts[1] || "";

      const ly = detectYearLevel(leftPart) ?? detectYearLevel(line);
      const ls = detectSemester(leftPart) ?? detectSemester(line);
      const ry = detectYearLevel(rightPart);
      const rs = detectSemester(rightPart);

      if (ly !== null) { leftYear = ly; currentYear = ly; }
      if (ls !== null) { leftSem = ls; currentSem = ls; }
      if (ry !== null) rightYear = ry;
      if (rs !== null) rightSem = rs;
      continue;
    }

    // ── Tab-separated row parsing ─────────────────────────────────────────────
    const tabCols = line.split("\t").map(c => c.trim());

    if (tabCols.length >= 6) {
      // Left semester block (columns 0–5)
      const c1 = colsToCourse(
        tabCols.slice(0, 6),
        leftYear ?? currentYear,
        leftSem ?? currentSem
      );
      if (c1) courses.push(c1);

      // Right semester block (columns 6–11), if present
      if (tabCols.length >= 12) {
        const c2 = colsToCourse(
          tabCols.slice(6, 12),
          rightYear ?? leftYear ?? currentYear,
          rightSem ?? currentSem
        );
        if (c2) courses.push(c2);
      } else if (tabCols.length >= 7 && isCourseCode(tabCols[6])) {
        // Partial right block
        const c2 = colsToCourse(
          tabCols.slice(6),
          rightYear ?? leftYear ?? currentYear,
          rightSem ?? currentSem
        );
        if (c2) courses.push(c2);
      }
      continue;
    }

    // ── Multi-space fallback (3+ spaces as column separator) ─────────────────
    if (tabCols.length < 2) {
      const spaceCols = line.split(/   +/).map(c => c.trim()).filter(Boolean);
      if (spaceCols.length >= 2) {
        const c = colsToCourse(spaceCols, currentYear, currentSem);
        if (c) courses.push(c);
      }
      continue;
    }

    // ── Try as partial row anyway ─────────────────────────────────────────────
    const c = colsToCourse(tabCols, currentYear, currentSem);
    if (c) courses.push(c);
  }

  // ── Fallback: regex-based line parser (handles side-by-side) ───────────────
  if (courses.length === 0) {
    return parseCoursesWithRegex(text);
  }

  return courses;
}

/**
 * Fallback parser using regex to extract courses from plain text,
 * handling cases where 2 courses are placed on the same line side-by-side.
 */
function parseCoursesWithRegex(text) {
  const courses = [];
  const fullText = text.replace(/\r?\n/g, " ").replace(/\s+/g, " ");

  // 1. Extract Electives First
  const electivesRegex = /(?:Free\s+Elective\s+\d+|^\d+|\b\d+\b)\s+([A-Za-z]{2,8}(?:-[A-Za-z0-9]+)?\s?\d{1,3}[A-Za-z]?)\s+(.{1,150}?)\s+(\d\s*[a-zA-Z]+\s*year,\s*\d\s*[a-zA-Z]+\s*Semester|\d\s*[a-zA-Z]+\s*Year,\s*Summer)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/gi;
  
  let eMatch;
  while ((eMatch = electivesRegex.exec(fullText)) !== null) {
      const code = eMatch[1].trim();
      let title = eMatch[2].trim() + " (Elective)";
      const termStr = eMatch[3].toLowerCase();
      let lec = Number(eMatch[4]);
      let lab = Number(eMatch[5]);
      let units = Number(eMatch[6]);
      
      let year = 1;
      if (termStr.includes("1") || termStr.includes("first")) year = 1;
      if (termStr.includes("2") || termStr.includes("second")) year = 2;
      if (termStr.includes("3") || termStr.includes("third")) year = 3;
      if (termStr.includes("4") || termStr.includes("fourth")) year = 4;
      
      let sem = 1;
      if (termStr.includes("1") && termStr.includes("sem")) sem = 1;
      if (termStr.includes("2") && termStr.includes("sem")) sem = 2;
      if (termStr.includes("summer")) sem = 3;

      courses.push({
        code,
        title,
        lectureHours: lec,
        labHours: lab,
        units,
        prereq: null,
        year_level: year,
        semester: sem
      });
  }

  // Remove the electives section from fullText so they aren't parsed again
  let coreText = fullText;
  const optionsIndex = coreText.search(/Options for Free Elective Courses/i);
  if (optionsIndex !== -1) {
      coreText = coreText.substring(0, optionsIndex);
  }

  // 2. Find all headings to know year/sem context
  const headings = [];
  const headingRegex = /(FIRST|1ST|SECOND|2ND|THIRD|3RD|FOURTH|4TH)\s*YEAR.{0,100}?((1ST|1\s*ST|FIRST)\s*SEM.*?(2ND|2\s*ND|SECOND)\s*SEM|(1ST|1\s*ST|FIRST)\s*SEM|(2ND|2\s*ND|SECOND)\s*SEM|SUMMER)/gi;
  let hMatch;
  while ((hMatch = headingRegex.exec(coreText)) !== null) {
      let hYear = 1;
      const hStr = hMatch[0].toUpperCase();
      if (hStr.includes("SECOND") || hStr.includes("2ND")) hYear = 2;
      if (hStr.includes("THIRD") || hStr.includes("3RD")) hYear = 3;
      if (hStr.includes("FOURTH") || hStr.includes("4TH")) hYear = 4;
      
      let sideBySide = /(1ST|1\s*ST|FIRST)\s*SEM.*?(2ND|2\s*ND|SECOND)\s*SEM/i.test(hStr);
      let isSummer = /SUMMER/i.test(hStr) && !sideBySide;
      
      headings.push({
          index: hMatch.index,
          year: hYear,
          sideBySide: sideBySide,
          isSummer: isSummer
      });
  }

  // 3. Extract core courses
  const courseRegex = /\b([A-Za-z]{2,8}(?:-[A-Za-z0-9]+)?\s?\d{1,3}[A-Za-z]?)\b\s+(.{1,150}?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s+(None|\b[A-Za-z]{2,8}(?:-[A-Za-z0-9]+)?\s?\d{1,3}[A-Za-z]?\b|[a-zA-Z\s\-]+?))?(?=\s*(?:\b[A-Za-z]{2,8}(?:-[A-Za-z0-9]+)?\s?\d{1,3}[A-Za-z]?\b|Total|FIRST|SECOND|THIRD|FOURTH|1ST|2ND|3RD|4TH|SUMMER|$))/gi;
  let match;
  let isSem2 = false;
  let lastHeadingIndex = -1;

  while ((match = courseRegex.exec(coreText)) !== null) {
      const code = match[1].trim();
      if (/^Total/i.test(code)) continue;
      if (/^(FIRST|SECOND|THIRD|FOURTH|1ST|2ND|3RD|4TH)$/i.test(code)) continue;

      let title = match[2].trim();
      let lec = Number(match[3]);
      let lab = Number(match[4]);
      let units = Number(match[5]);
      let pre = match[6] ? match[6].trim() : null;
      if (pre && /^none$/i.test(pre)) pre = null;

      // Find active heading
      let currentHeading = headings.slice().reverse().find(h => h.index < match.index);
      
      let year = 1;
      let sideBySide = false;
      let isSummer = false;

      if (currentHeading) {
          year = currentHeading.year;
          sideBySide = currentHeading.sideBySide;
          isSummer = currentHeading.isSummer;
          
          if (currentHeading.index !== lastHeadingIndex) {
              isSem2 = false; // Reset alternation when entering a new heading block
              lastHeadingIndex = currentHeading.index;
          }
      }

      let sem = 1;
      if (isSummer) {
          sem = 3;
      } else if (sideBySide) {
          sem = isSem2 ? 2 : 1;
          isSem2 = !isSem2;
      } else {
          // If not side by side, guess based on previous text if it's 2nd sem
          const textBefore = coreText.substring(Math.max(0, match.index - 500), match.index);
          if (/(2ND|SECOND)\s*SEM/i.test(textBefore) && !/(1ST|FIRST)\s*SEM/i.test(textBefore)) {
              sem = 2;
          }
      }

      courses.push({
        code,
        title,
        lectureHours: lec,
        labHours: lab,
        units,
        prereq: pre,
        year_level: year,
        semester: sem
      });
  }

  return courses;
}

/**
 * Normalizes a parsed course object, ensuring all fields are present.
 *
 * @param {Object} course Raw course object.
 * @returns {Object|null} Normalized course or null if invalid.
 */
export function normalizeParsedCourse(course) {
  if (!course) return null;
  const { code, title, units, lectureHours, labHours, prereq, year_level, semester } = course;
  return {
    code: (code || "").trim(),
    title: (title || "").trim(),
    lectureHours: lectureHours || 0,
    labHours: labHours || 0,
    units: units ?? 3,
    prereq: prereq ? String(prereq).trim() : null,
    coreq: null,
    year_level: year_level ?? null,
    semester: semester ?? null,
    prerequisites: [],
    corequisites: [],
  };
}

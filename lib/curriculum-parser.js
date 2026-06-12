// lib/curriculum-parser.js
// Provides basic utilities for extracting and normalizing course information
// from raw curriculum text (e.g., PDF or DOCX extraction).

/**
 * Parses raw curriculum text into an array of course objects.
 * The implementation is tolerant of fragmented OCR output.
 * Expected line format (example): "2021 CS101 Introduction to Programming"
 *
 * @param {string} text Raw text extracted from the uploaded file.
 * @returns {Array<Object>} Array of course objects with tentative fields.
 */
export function parseCoursesFromDocumentText(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const courses = [];
  const courseLineRegex = /^(\d{4})\s+([A-Z]{2,5}\d{3,4})\s+(.+)$/; // e.g., "2021 CS101 Intro"
  for (const line of lines) {
    const match = line.match(courseLineRegex);
    if (match) {
      const [, year, code, title] = match;
      courses.push({ year: Number(year), code, title: title.trim() });
    }
  }
  return courses;
}

/**
 * Normalizes a parsed course object.
 * Ensures required fields are present and trims whitespace.
 * This placeholder can be expanded to handle prerequisites, co‑requisites, etc.
 *
 * @param {Object} course Raw course object.
 * @returns {Object|null} Normalized course or null if input invalid.
 */
export function normalizeParsedCourse(course) {
  if (!course) return null;
  const { year, code, title } = course;
  return {
    year: year ?? null,
    code: (code || "").trim(),
    title: (title || "").trim(),
    prerequisites: [],
    corequisites: [],
  };
}

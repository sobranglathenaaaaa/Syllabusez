export const YEAR_ORDER = {
  "FIRST YEAR": 1,
  "SECOND YEAR": 2,
  "THIRD YEAR": 3,
  "FOURTH YEAR": 4
};

export const SEMESTER_ORDER = {
  "1st Semester": 1,
  "2nd Semester": 2,
  "Summer Term": 3
};

function normalizeYearLabel(year) {
  const value = String(year || "").trim().toUpperCase();
  if (YEAR_ORDER[value]) return value;
  if (/\b1(ST)?\b|FIRST/i.test(value)) return "FIRST YEAR";
  if (/\b2(ND)?\b|SECOND/i.test(value)) return "SECOND YEAR";
  if (/\b3(RD)?\b|THIRD/i.test(value)) return "THIRD YEAR";
  if (/\b4(TH)?\b|FOURTH/i.test(value)) return "FOURTH YEAR";
  return value || "UNASSIGNED";
}

function normalizeSemesterLabel(semester) {
  const value = String(semester || "").trim();
  const lower = value.toLowerCase();

  if (!value) return "Unassigned Semester";
  if (value === "3" || /summer/i.test(lower)) return "Summer Term";
  if (value === "2" || /\b2(?:nd)?\b|\bsecond\b/i.test(lower)) return "2nd Semester";
  if (value === "1" || /\b1(?:st)?\b|\bfirst\b/i.test(lower)) return "1st Semester";
  return value;
}

export function groupCoursesByYearSemester(courses) {
  const grouped = {};

  courses.forEach((course) => {
    const year = normalizeYearLabel(course.year_level);
    const semester = normalizeSemesterLabel(course.semester);
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][semester]) grouped[year][semester] = [];
    grouped[year][semester].push(course);
  });

  const sortedYears = Object.keys(grouped).sort(
    (a, b) => (YEAR_ORDER[a] || 99) - (YEAR_ORDER[b] || 99)
  );

  return { grouped, sortedYears };
}

export function sortSemesters(semesters) {
  return [...semesters].sort((a, b) => {
    const normalizedA = String(a || "").trim();
    const normalizedB = String(b || "").trim();
    return (SEMESTER_ORDER[normalizedA] || 99) - (SEMESTER_ORDER[normalizedB] || 99);
  });
}

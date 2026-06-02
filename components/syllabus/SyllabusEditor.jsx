"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Image as ImageIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Calendar,
  Layers,
  Percent,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  Info
} from "lucide-react";
import Tesseract from "tesseract.js";

// PUP Academic Defaults
const DEFAULT_PUP_VISION = "PUP: The National Polytechnic University (PUP: Pambansang Politeknikong Unibersidad)";

const DEFAULT_PUP_MISSION = `Ensuring inclusive and equitable quality education and promoting lifelong learning opportunities through a re-engineered polytechnic university by committing to:
- Provide democratized access to educational opportunities for the holistic development of individuals with global perspective
- Offer industry-oriented curricula that produce highly-skilled professionals with managerial and technical capabilities and a strong sense of public service for nation building
- Embed a culture of research and innovation
- Continuously develop faculty and employees with the highest level of professionalism
- Engage public and private institutions and other stakeholders for the attainment of social development goals establish a strong presence and impact in the international academic community`;

const DEFAULT_PUP_QUALITY_POLICY = `The Polytechnic University of the Philippines commits to provide inclusive and equitable quality education and promote lifelong learning opportunities for human advancement and social transformation through re-engineered polytechnic academic programs. Toward this end, we, the members of the PUP Community will vigorously and steadfastly endeavor to continuously improve the standard of university services to the satisfaction of our clients through the adoption and continuous review of our Quality Management System.`;

const DEFAULT_ILOS = [];

export function SyllabusEditor({ syllabusId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cascading dropdown data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  // Editor Active Section
  const [activeSection, setActiveSection] = useState("A");

  // SECTION A: Course Identification & Metadata State
  const [courseId, setCourseId] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [corequisites, setCorequisites] = useState("");
  const [semester, setSemester] = useState("1st Semester");
  const [academicYear, setAcademicYear] = useState("2025-2026");

  // SECTION B: Vision, Mission, and Goals State
  const [vision, setVision] = useState(DEFAULT_PUP_VISION);
  const [mission, setMission] = useState(DEFAULT_PUP_MISSION);
  const [qualityPolicy, setQualityPolicy] = useState(DEFAULT_PUP_QUALITY_POLICY);
  const [institutionalOutcomes, setInstitutionalOutcomes] = useState([]);

  // SECTION C: Learning Outcomes Manager State
  const [programOutcomes, setProgramOutcomes] = useState([]);
  const [courseOutcomes, setCourseOutcomes] = useState([]);
  // Added Campus Goals state
  const [campusGoals, setCampusGoals] = useState([]);

  // Performance Indicators state
  const [performanceIndicators, setPerformanceIndicators] = useState([]);

  // ILO and Campus Goals handlers
  const addILO = () => {
    setInstitutionalOutcomes([...institutionalOutcomes, { name: "", meaning: "" }]);
  };
  const removeILO = (index) => {
    const list = [...institutionalOutcomes];
    list.splice(index, 1);
    setInstitutionalOutcomes(list);
  };
  const updateILO = (index, field, value) => {
    const list = [...institutionalOutcomes];
    if (typeof list[index] !== "object") {
      list[index] = { name: list[index] || "", meaning: "" };
    }
    list[index][field] = value;
    setInstitutionalOutcomes(list);
  };

  const addCampusGoal = () => {
    setCampusGoals([...campusGoals, ""]);
  };
  const removeCampusGoal = (index) => {
    const list = [...campusGoals];
    list.splice(index, 1);
    setCampusGoals(list);
  };
  const updateCampusGoal = (index, value) => {
    const list = [...campusGoals];
    list[index] = value;
    setCampusGoals(list);
  };

  // SECTION D: Weekly Plan Builder State
  const [weeklyPlans, setWeeklyPlans] = useState([]);

  // SECTION E: Grading Components State
  const [gradingComponents, setGradingComponents] = useState([]);

  const totalGradingPercentage = gradingComponents.reduce((sum, item) => sum + item.percentage, 0);
  const isGradingValid = totalGradingPercentage === 100;


  // OCR Auto-fill state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Fetch departments, courses, and syllabus details
  useEffect(() => {
    const initData = async () => {
      try {
        const deptRes = await fetch("/api/departments");
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);

        const courseRes = await fetch("/api/courses");
        const courseData = await courseRes.json();
        setCourses(courseData.courses || []);

        // Load Syllabus details if editing
        if (syllabusId) {
          const sylRes = await fetch(`/api/syllabi/${syllabusId}`);
          const sylData = await sylRes.json();
          const s = sylData.syllabus;

          if (s) {
            setCourseId(s.course_id);
            // Match the department
            const matchedCourse = courseData.courses?.find(c => c.id === s.course_id);
            if (matchedCourse) {
              setSelectedDept(matchedCourse.department_id);
            }

            setCourseDescription(s.course_description || "");
            setPrerequisites(s.prerequisites || "");
            setCorequisites(s.corequisites || "");
            setSemester(s.semester || "1st Semester");
            setAcademicYear(s.academic_year || "2025-2026");

            if (s.vision) setVision(s.vision);
            if (s.mission) setMission(s.mission);
            if (s.quality_policy) setQualityPolicy(s.quality_policy);
            if (s.institutional_outcomes?.length > 0) setInstitutionalOutcomes(s.institutional_outcomes);

            if (s.program_outcomes?.length > 0) setProgramOutcomes(s.program_outcomes);
            if (s.course_outcomes?.length > 0) setCourseOutcomes(s.course_outcomes);
            if (s.performance_indicators?.length > 0) setPerformanceIndicators(s.performance_indicators);

            if (s.weekly_plans?.length > 0) {
              setWeeklyPlans(s.weekly_plans.map(p => ({
                week: p.week,
                topic: p.topic || "",
                desiredLearningOutcomes: p.desired_learning_outcomes || "",
                learningContent: p.learning_content || p.topic || "",
                faceFace: p.face_face || "",
                synchronous: p.synchronous || "",
                asynchronous: p.asynchronous || "",
                activities: p.activities || "",
                assessments: p.assessments || "",
                materials: p.materials || "",
                cloAlignment: p.clo_alignment || [],
                expanded: false
              })));
            }

            if (s.grading_components?.length > 0) {
              setGradingComponents(s.grading_components.map(g => ({
                name: g.name,
                percentage: g.percentage
              })));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load editor workspace:", err);
      }
      setLoading(false);
    };

    initData();
  }, [syllabusId]);

  // Filter courses based on selected department
  const filteredCoursesDropdown = selectedDept
    ? courses.filter(c => c.department_id === selectedDept)
    : courses;

  // Selected course model helper
  const selectedCourseModel = courses.find(c => c.id === courseId);

  // Section Progress calculator
  const getSectionProgress = (sec) => {
    switch (sec) {
      case "A":
        return courseId && semester && academicYear && courseDescription ? 100 : (courseId ? 60 : 0);
      case "B":
        return vision && mission && qualityPolicy && institutionalOutcomes.length > 0 ? 100 : 50;
      case "C":
        return programOutcomes.length > 0 && courseOutcomes.length > 0 && performanceIndicators.length > 0 ? 100 : 30;
      case "D":
        return weeklyPlans.length > 0 && weeklyPlans.every(w => w.topic.trim()) ? 100 : 50;
      case "E":
        return isGradingValid ? 100 : 30;
      default:
        return 0;
    }
  };

  const totalProgress = Math.round(
    (["A", "B", "C", "D", "E"].reduce((sum, s) => sum + getSectionProgress(s), 0) / 500) * 100
  );

  // SECTION C Helpers: Add/Remove/Update Program Outcomes (PLOs)
  const addPLO = () => {
    const nextId = `PLO-${programOutcomes.length + 1}`;
    setProgramOutcomes([...programOutcomes, { id: nextId, description: "", alignments: [] }]);
  };
  const removePLO = (index) => {
    const list = [...programOutcomes];
    list.splice(index, 1);
    // Re-index IDs
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `PLO-${i + 1}`
    }));
    setProgramOutcomes(reindexed);
  };
  const updatePLO = (index, field, value) => {
    const list = [...programOutcomes];
    list[index][field] = value;
    setProgramOutcomes(list);
  };
  const movePLO = (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= programOutcomes.length) return;
    const list = [...programOutcomes];
    const [item] = list.splice(index, 1);
    list.splice(nextIdx, 0, item);
    // Re-index IDs
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `PLO-${i + 1}`
    }));
    setProgramOutcomes(reindexed);
  };

  // SECTION C Helpers: Add/Remove/Update Course Outcomes (CLOs)
  const addCLO = () => {
    const nextId = `CLO-${courseOutcomes.length + 1}`;
    setCourseOutcomes([...courseOutcomes, { id: nextId, description: "", alignments: [] }]);
  };
  const removeCLO = (index) => {
    const list = [...courseOutcomes];
    list.splice(index, 1);
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `CLO-${i + 1}`
    }));
    setCourseOutcomes(reindexed);
  };
  const updateCLO = (index, field, value) => {
    const list = [...courseOutcomes];
    list[index][field] = value;
    setCourseOutcomes(list);
  };
  const moveCLO = (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= courseOutcomes.length) return;
    const list = [...courseOutcomes];
    const [item] = list.splice(index, 1);
    list.splice(nextIdx, 0, item);
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `CLO-${i + 1}`
    }));
    setCourseOutcomes(reindexed);
  };

  // SECTION C Helpers: Add/Remove/Update Performance Indicators (PIs)
  const addPI = () => {
    const nextId = `PI-${performanceIndicators.length + 1}`;
    setPerformanceIndicators([...performanceIndicators, { id: nextId, description: "", alignments: [] }]);
  };
  const removePI = (index) => {
    const list = [...performanceIndicators];
    list.splice(index, 1);
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `PI-${i + 1}`
    }));
    setPerformanceIndicators(reindexed);
  };
  const updatePI = (index, field, value) => {
    const list = [...performanceIndicators];
    list[index][field] = value;
    setPerformanceIndicators(list);
  };
  const movePI = (index, direction) => {
    const nextIdx = index + direction;
    if (nextIdx < 0 || nextIdx >= performanceIndicators.length) return;
    const list = [...performanceIndicators];
    const [item] = list.splice(index, 1);
    list.splice(nextIdx, 0, item);
    const reindexed = list.map((item, i) => ({
      ...item,
      id: `PI-${i + 1}`
    }));
    setPerformanceIndicators(reindexed);
  };

  // SECTION D: Weekly Plan Helpers
  const addWeek = () => {
    const nextWeekNum = weeklyPlans.length + 1;
    setWeeklyPlans([
      ...weeklyPlans,
      {
        week: nextWeekNum,
        desiredLearningOutcomes: "",
        learningContent: "",
        faceFace: "",
        synchronous: "",
        asynchronous: "",
        assessments: "",
        cloAlignment: [],
        // legacy fields kept for backward compat
        topic: "",
        activities: "",
        materials: "",
        expanded: false
      }
    ]);
  };
  const removeWeek = (index) => {
    const list = [...weeklyPlans];
    list.splice(index, 1);
    const reindexed = list.map((item, i) => ({ ...item, week: i + 1 }));
    setWeeklyPlans(reindexed);
  };
  const handleWeekChange = (index, field, value) => {
    const list = [...weeklyPlans];
    list[index][field] = value;
    setWeeklyPlans(list);
  };
  const toggleWeekExpand = (index) => {
    const list = [...weeklyPlans];
    list[index].expanded = !list[index].expanded;
    setWeeklyPlans(list);
  };

  // SECTION E: Grading Components Helpers
  const addGradingComponent = () => {
    setGradingComponents([...gradingComponents, { name: "", percentage: 10 }]);
  };
  const removeGradingComponent = (index) => {
    const list = [...gradingComponents];
    list.splice(index, 1);
    setGradingComponents(list);
  };
  const handleGradingChange = (index, field, value) => {
    const list = [...gradingComponents];
    if (field === "percentage") {
      list[index].percentage = Math.max(0, parseInt(value) || 0);
    } else {
      list[index].name = value;
    }
    setGradingComponents(list);
  };

  // OCR Document Parser Helper
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrProgress(0);
    setOcrStatusText("Spawning client-side OCR character reader engine...");
    setOcrSuccess(false);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrStatusText(`Extracting characters...`);
            setOcrProgress(Math.floor(m.progress * 100));
          }
        }
      });

      const text = result.data.text;
      setOcrStatusText("Parsing text structures and segments...");

      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

      let parsedOutcomes = [];
      let parsedWeeks = [];
      let parsedGrading = [];

      let parsingOutcomes = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();

        // Detect Course outcomes sections
        if (lowerLine.includes("outcomes") || lowerLine.includes("objectives") || lowerLine.includes("intended learning")) {
          parsingOutcomes = true;
          continue;
        }

        if (parsingOutcomes) {
          if (lowerLine.includes("week") || lowerLine.includes("schedule") || lowerLine.includes("grading") || lowerLine.includes("evaluation")) {
            parsingOutcomes = false;
          } else {
            const clean = line.replace(/^([•\-\*\d\.\)\s]+)/, "").trim();
            if (clean.length > 15) {
              parsedOutcomes.push(clean);
            }
          }
        }

        // Detect Weekly Plan
        const weekMatch = line.match(/Week\s*(\d+)/i);
        if (weekMatch) {
          const weekNum = parseInt(weekMatch[1]);
          const topicCandidate = line.replace(weekMatch[0], "").replace(/^[:\-,\s]+/, "").trim();
          const topic = topicCandidate.length > 5 ? topicCandidate : (lines[i + 1] || "");

          parsedWeeks.push({
            week: weekNum,
            topic: topic || `Syllabus Topic Week ${weekNum}`,
            activities: "Interactive Lecture & Coding Lab",
            assessments: "Practical programming quiz",
            materials: "Reference handbooks & Slides",
            desiredLearningOutcomes: "Explain logic structures and debug arrays",
            cloAlignment: ["CLO-1"],
            expanded: false
          });
        }

        // Detect Grading
        const pctMatch = line.match(/([a-zA-Z\s]+)[-:]?\s*(\d+)\s*%/);
        if (pctMatch) {
          const name = pctMatch[1].trim();
          const pct = parseInt(pctMatch[2]);
          if (name.length > 3 && pct > 0 && pct < 100) {
            parsedGrading.push({ name, percentage: pct });
          }
        }
      }

      // Map parsed findings to state
      if (parsedOutcomes.length > 0) {
        const mappedClos = parsedOutcomes.map((desc, idx) => ({
          id: `CLO-${idx + 1}`,
          description: desc,
          alignments: ["PLO-1"]
        }));
        setCourseOutcomes(mappedClos);
      }

      if (parsedWeeks.length > 0) {
        parsedWeeks.sort((a, b) => a.week - b.week);
        const mappedWeeks = parsedWeeks.map((item, idx) => ({ ...item, week: idx + 1 }));
        setWeeklyPlans(mappedWeeks);
      }

      if (parsedGrading.length > 0) {
        const sum = parsedGrading.reduce((s, x) => s + x.percentage, 0);
        if (sum === 100) {
          setGradingComponents(parsedGrading);
        }
      }

      setOcrSuccess(true);
      setOcrStatusText("OCR Parsing complete. Structured data loaded into Outcomes, Calendar, and Grading.");
    } catch (err) {
      console.error(err);
      setOcrStatusText("OCR Character extraction failed. Text was too distorted.");
    }
    setOcrLoading(false);
  };

  // Submit/Save Handler
  const handleSave = async (statusType) => {
    if (!courseId) {
      alert("Please select a Program and associated Course first.");
      setActiveSection("A");
      return;
    }

    if (statusType === "submitted" && !isGradingValid) {
      alert("Submission blocked. Grading percentages must total exactly 100%.");
      setActiveSection("E");
      return;
    }

    // Pack modern payload
    const payload = {
      courseId,
      status: statusType,
      courseDescription,
      prerequisites,
      corequisites,
      semester,
      academicYear,
      vision,
      mission,
      qualityPolicy,
      institutionalOutcomes,
      programOutcomes,
      courseOutcomes,
      performanceIndicators,
      learningOutcomes: courseOutcomes.map(c => ({ description: c.description })), // backward compatibility
      weeklyPlans: weeklyPlans.map(w => ({
        week: w.week,
        topic: w.topic,
        activities: w.activities,
        assessments: w.assessments,
        materials: w.materials,
        desiredLearningOutcomes: w.desiredLearningOutcomes,
        cloAlignment: w.cloAlignment
      })),
      gradingComponents
    };

    setSubmitting(true);
    try {
      const endpoint = syllabusId ? `/api/syllabi/${syllabusId}` : "/api/syllabi";
      const method = syllabusId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/instructor/syllabi");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save syllabus.");
      }
    } catch (e) {
      console.error(e);
      alert("A network error occurred while saving.");
    }
    setSubmitting(false);
  };

  // Quick navigation handlers
  const sectionsList = [
    { key: "A", name: "Course Identification", icon: Info },
    { key: "B", name: "Vision, Mission, & Goals", icon: BookOpen },
    { key: "C", name: "Learning Outcomes", icon: Award },
    { key: "D", name: "OBTL Weekly Calendar", icon: Calendar },
    { key: "E", name: "Grading Configurations", icon: Percent }
  ];

  const navigateNext = () => {
    const idx = sectionsList.findIndex(s => s.key === activeSection);
    if (idx < sectionsList.length - 1) {
      setActiveSection(sectionsList[idx + 1].key);
    }
  };

  const navigatePrev = () => {
    const idx = sectionsList.findIndex(s => s.key === activeSection);
    if (idx > 0) {
      setActiveSection(sectionsList[idx - 1].key);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-gray-500 tracking-wider">Preparing Outcomes-Based Editor Canvas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative min-h-[80vh] pb-32">
      {/* 1. Left Sidebar Section Selector */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3 sticky top-20 z-10">
        <div className="px-2 pb-2 border-b border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Canvas Workspace</span>
          <span className="text-sm font-bold text-gray-900 block mt-0.5">Syllabus Outline</span>
        </div>

        <div className="space-y-1">
          {sectionsList.map((sec) => {
            const IconComponent = sec.icon;
            const progress = getSectionProgress(sec.key);
            const isActive = activeSection === sec.key;

            return (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group text-left ${isActive
                  ? "bg-[#800000]/5 text-[#800000] font-bold border-l-4 border-[#800000]"
                  : "text-gray-600 hover:bg-gray-50 font-medium"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? "text-[#800000]" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                  />
                  <span className="text-xs">{sec.name}</span>
                </div>

                {/* Micro circular/check indicator */}
                {progress === 100 ? (
                  <Check className="w-4 h-4 text-green-500 bg-green-50 rounded-full p-0.5" />
                ) : (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded-md">
                    {progress}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Progress Indicator Card */}
        <div className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl space-y-2 mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span>Syllabus Progress</span>
            <span className="text-[#800000] font-extrabold">{totalProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#800000] transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
      </aside>

      {/* 2. Main Editable Canvas Area */}
      <main className="flex-1 w-full bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm min-h-[50vh] transition-all duration-300">

        {/* Section A: Course Information */}
        {activeSection === "A" && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">A. Course Identification</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">Polytechnic Course Catalog Fields</p>
              </div>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Academic Program / Dept</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCourseId("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                >
                  <option value="">Select a Program</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Associated Course Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Associated Course</label>
                <select
                  value={courseId}
                  disabled={!selectedDept}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {filteredCoursesDropdown.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read-only derived values from course details */}
            {selectedCourseModel && (
              <div className="grid grid-cols-3 gap-4 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl text-xs">
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider">Course Code</span>
                  <span className="font-extrabold text-[#800000] mt-0.5 block">{selectedCourseModel.code}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider">Course Title</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{selectedCourseModel.title}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider">Course Credits</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{selectedCourseModel.units} Units</span>
                </div>
              </div>
            )}

            {/* Semester and Academic Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Academic Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer Term">Summer Term</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Academic Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2025-2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                />
              </div>
            </div>

            {/* Prerequisites and Co-requisites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Pre-requisite Courses</label>
                <input
                  type="text"
                  placeholder="e.g. None or COMP 001"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Co-requisite Courses</label>
                <input
                  type="text"
                  placeholder="e.g. None"
                  value={corequisites}
                  onChange={(e) => setCorequisites(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                />
              </div>
            </div>

            {/* Course Description */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Course Catalog Description</label>
              <textarea
                rows={4}
                required
                placeholder="Provide a comprehensive academic description of the course catalog details, topics, and programming environment bounds..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white leading-relaxed resize-y"
              />
            </div>
          </div>
        )}

        {/* Section B: Vision, Mission, and Goals */}
        {activeSection === "B" && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">B. Vision, Mission, & Quality Policies</h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">Polytechnic Official Document Headers</p>
            </div>

            {/* elegant cards */}
            <div className="space-y-5">
              {/* PUP Vision Card */}
              <div className="p-5 border border-amber-100 bg-amber-50/5 rounded-2xl space-y-2 relative overflow-hidden transition-shadow hover:shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-sm" />
                  <span>University Vision</span>
                </h4>
                <textarea
                  rows={2}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs font-bold text-gray-800 leading-relaxed resize-none focus:outline-none"
                />
              </div>

              {/* PUP Mission Card */}
              <div className="p-5 border border-red-100 bg-red-50/5 rounded-2xl space-y-2 relative overflow-hidden transition-shadow hover:shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#800000]/5 rounded-full blur-xl" />
                <h4 className="text-xs font-black text-[#800000] uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-[#800000] rounded-sm" />
                  <span>University Mission</span>
                </h4>
                <textarea
                  rows={5}
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs font-medium text-gray-700 leading-relaxed resize-y focus:outline-none"
                />
              </div>

              {/* PUP Quality Policy Card */}
              <div className="p-5 border border-indigo-100 bg-indigo-50/5 rounded-2xl space-y-2 relative overflow-hidden transition-shadow hover:shadow-sm">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
                <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-sm" />
                  <span>Quality Policy Statement</span>
                </h4>
                <textarea
                  rows={4}
                  value={qualityPolicy}
                  onChange={(e) => setQualityPolicy(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-xs font-medium text-gray-700 leading-relaxed resize-y focus:outline-none"
                />
              </div>

              {/* Institutional Learning Outcomes Card */}
              <div className="p-5 border border-gray-100 bg-gray-50/20 rounded-2xl space-y-3">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-gray-500 rounded-sm" />
                  <span>Institutional Learning Outcomes (ILOs)</span>
                </h4>

                <div className="space-y-2.5">

                  {/* Institutional Learning Outcomes (ILO) Section */}
                  <div className="grid grid-cols-2 gap-4 mb-6 border border-gray-200 rounded-xl overflow-hidden">
                    {/* Header Column */}
                    <div className="bg-gray-100 flex items-center justify-center p-4">
                      <h4 className="text-sm font-bold uppercase text-gray-700 tracking-wider">
                        Institutional Learning Outcomes (ILO)
                      </h4>
                    </div>
                    {/* Content Column */}
                    <div className="p-4 space-y-3">
                      {institutionalOutcomes.map((ilo, idx) => {
                        const name = typeof ilo === "object" ? ilo.name : ilo;
                        const meaning = typeof ilo === "object" ? ilo.meaning : "";
                        return (
                          <div key={idx} className="space-y-1.5 p-2 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-600 w-5 text-right">{idx + 1}.</span>
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => updateILO(idx, "name", e.target.value)}
                                placeholder="Institutional Learning Outcome Title"
                                className="flex-1 border-b border-gray-300 text-sm font-semibold focus:border-[#800000] focus:outline-none"
                              />
                              <button type="button" onClick={() => removeILO(idx)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="pl-7">
                              <input
                                type="text"
                                value={meaning}
                                onChange={(e) => updateILO(idx, "meaning", e.target.value)}
                                placeholder="→ Sub-line / Meaning for this outcome..."
                                className="w-full border-b border-dashed border-gray-200 text-xs text-gray-500 focus:border-[#800000] focus:outline-none py-0.5 italic"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <button type="button" onClick={addILO} className="mt-2 text-xs text-[#800000] hover:underline">
                        + Add ILO
                      </button>
                    </div>
                  </div>

                  {/* Campus Goals Section */}
                  <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 flex items-center justify-center p-4">
                      <h4 className="text-sm font-bold uppercase text-gray-700 tracking-wider">Campus Goals</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {campusGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-gray-600 w-5 text-right">{idx + 1}.</span>

                          <input
                            type="text"
                            value={goal}
                            onChange={(e) => updateCampusGoal(idx, e.target.value)}
                            placeholder="Campus goal description"
                            className="flex-1 border-b border-gray-300 text-sm focus:border-[#800000] focus:outline-none"
                          />
                          <button type="button" onClick={() => removeCampusGoal(idx)} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={addCampusGoal} className="mt-2 text-xs text-[#800000] hover:underline">
                        + Add Campus Goal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section C: Learning Outcomes Manager */}
        {activeSection === "C" && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">C. Outcomes Mapping Alignment Canvas</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">IntegratedAdd Institutional OutcomeAlignment</p>
              </div>
            </div>

            {/* 1. Program Learning Outcomes (PLOs) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <h4 className="text-xs font-black text-[#800000] uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>1. Program Learning Outcomes (PLO)</span>
                </h4>
                <button
                  type="button"
                  onClick={addPLO}
                  className="px-2.5 py-1 text-[10px] font-bold border border-[#800000]/20 text-[#800000] hover:bg-[#800000]/5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add PLO</span>
                </button>
              </div>

              <div className="space-y-3">
                {programOutcomes.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 bg-white">
                    No Program Learning Outcomes defined. Click &quot;+ Add PLO&quot; to get started.
                  </div>
                ) : (
                  programOutcomes.map((plo, idx) => (
                    <div key={plo.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 flex gap-4 items-start relative group">
                      <span className="px-2.5 py-1 bg-[#800000] text-amber-400 font-black text-[10px] rounded-lg shadow-sm">
                        {plo.id}
                      </span>

                      <div className="flex-1">
                        <textarea
                          rows={2}
                          placeholder="Describe Program Learning Outcome standard expected upon graduation..."
                          value={plo.description}
                          onChange={(e) => updatePLO(idx, "description", e.target.value)}
                          className="w-full p-2.5 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]/10 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => movePLO(idx, -1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => movePLO(idx, 1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePLO(idx)}
                          className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PLO to ILO Alignment Matrix */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">PLO to ILO Alignment Matrix</span>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-gray-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 text-center">
                          <th className="py-2.5 px-4 border w-36 text-left">Program Outcome (PLO)</th>
                          {institutionalOutcomes.map((ilo, iloIdx) => {
                            const iloName = typeof ilo === "object" ? ilo.name : ilo;
                            return (
                              <th key={iloIdx} className="py-2.5 px-3 border max-w-[150px] truncate" title={iloName}>
                                {iloName || `ILO-${iloIdx + 1}`}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {programOutcomes.length === 0 ? (
                          <tr>
                            <td colSpan={institutionalOutcomes.length + 1} className="py-4 text-center text-gray-400 italic">
                              No PLOs defined to align.
                            </td>
                          </tr>
                        ) : (
                          programOutcomes.map((plo, ploIdx) => (
                            <tr key={plo.id} className="hover:bg-gray-50/50">
                              <td className="py-2 px-4 border font-bold text-[#800000]" title={plo.description}>
                                {plo.id}
                              </td>
                              {institutionalOutcomes.map((ilo, iloIdx) => {
                                const iloName = typeof ilo === "object" ? ilo.name : ilo;
                                return (
                                  <td key={iloIdx} className="p-2 border text-center">
                                    <input
                                      type="checkbox"
                                      disabled={!iloName}
                                      checked={plo.alignments?.includes(iloName)}
                                      onChange={() => {
                                        const current = plo.alignments || [];
                                        const updated = current.includes(iloName)
                                          ? current.filter(x => x !== iloName)
                                          : [...current, iloName];
                                        updatePLO(ploIdx, "alignments", updated);
                                      }}
                                      className="w-4 h-4 text-[#800000] focus:ring-[#800000] border-gray-300 rounded cursor-pointer"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Course Learning Outcomes (CLOs) */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>2. Course Learning Outcomes (CLO)</span>
                </h4>
                <button
                  type="button"
                  onClick={addCLO}
                  className="px-2.5 py-1 text-[10px] font-bold border border-amber-600/20 text-amber-700 hover:bg-amber-600/5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add CLO</span>
                </button>
              </div>

              <div className="space-y-3">
                {courseOutcomes.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 bg-white">
                    No Course Learning Outcomes defined. Click "+ Add CLO" to get started.
                  </div>
                ) : (
                  courseOutcomes.map((clo, idx) => (
                    <div key={clo.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 flex gap-4 items-start relative group">
                      <span className="px-2.5 py-1 bg-amber-700 text-white font-black text-[10px] rounded-lg shadow-sm">
                        {clo.id}
                      </span>

                      <div className="flex-1">
                        <textarea
                          rows={2}
                          placeholder="Describe specific course execution parameters expected of students..."
                          value={clo.description}
                          onChange={(e) => updateCLO(idx, "description", e.target.value)}
                          className="w-full p-2.5 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]/10 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => moveCLO(idx, -1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => moveCLO(idx, 1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCLO(idx)}
                          className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* CLO to PLO Alignment Matrix */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">CLO to PLO Alignment Matrix</span>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-gray-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 text-center">
                          <th className="py-2.5 px-4 border w-36 text-left">Course Outcome (CLO)</th>
                          {programOutcomes.map((plo) => (
                            <th key={plo.id} className="py-2.5 px-3 border max-w-[150px] truncate" title={plo.description}>
                              {plo.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {courseOutcomes.length === 0 ? (
                          <tr>
                            <td colSpan={programOutcomes.length + 1} className="py-4 text-center text-gray-400 italic">
                              No CLOs defined to align.
                            </td>
                          </tr>
                        ) : (
                          courseOutcomes.map((clo, cloIdx) => (
                            <tr key={clo.id} className="hover:bg-gray-50/50">
                              <td className="py-2 px-4 border font-bold text-amber-700" title={clo.description}>
                                {clo.id}
                              </td>
                              {programOutcomes.map((plo) => (
                                <td key={plo.id} className="p-2 border text-center">
                                  <input
                                    type="checkbox"
                                    checked={clo.alignments?.includes(plo.id)}
                                    onChange={() => {
                                      const current = clo.alignments || [];
                                      const updated = current.includes(plo.id)
                                        ? current.filter(x => x !== plo.id)
                                        : [...current, plo.id];
                                      updateCLO(cloIdx, "alignments", updated);
                                    }}
                                    className="w-4 h-4 text-[#800000] focus:ring-[#800000] border-gray-300 rounded cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Performance Indicators (PIs) */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>3. Performance Indicators (PI)</span>
                </h4>
                <button
                  type="button"
                  onClick={addPI}
                  className="px-2.5 py-1 text-[10px] font-bold border border-indigo-600/20 text-indigo-700 hover:bg-indigo-600/5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add PI</span>
                </button>
              </div>

              <div className="space-y-3">
                {performanceIndicators.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 bg-white">
                    No Performance Indicators defined. Click "+ Add PI" to get started.
                  </div>
                ) : (
                  performanceIndicators.map((pi, idx) => (
                    <div key={pi.id} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/30 flex gap-4 items-start relative group">
                      <span className="px-2.5 py-1 bg-indigo-700 text-white font-black text-[10px] rounded-lg shadow-sm">
                        {pi.id}
                      </span>

                      <div className="flex-1">
                        <textarea
                          rows={2}
                          placeholder="Describe measurable performance metrics and evidences of logic coding..."
                          value={pi.description}
                          onChange={(e) => updatePI(idx, "description", e.target.value)}
                          className="w-full p-2.5 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]/10 bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => movePI(idx, -1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => movePI(idx, 1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePI(idx)}
                          className="p-1 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PI to PLO Alignment Matrix */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">PI to PLO Alignment Matrix</span>
                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-inner bg-gray-50/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 text-center">
                          <th className="py-2.5 px-4 border w-36 text-left">Performance Indicator (PI)</th>
                          {programOutcomes.map((plo) => (
                            <th key={plo.id} className="py-2.5 px-3 border max-w-[150px] truncate" title={plo.description}>
                              {plo.id}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                        {performanceIndicators.length === 0 ? (
                          <tr>
                            <td colSpan={programOutcomes.length + 1} className="py-4 text-center text-gray-400 italic">
                              No PIs defined to align.
                            </td>
                          </tr>
                        ) : (
                          performanceIndicators.map((pi, piIdx) => (
                            <tr key={pi.id} className="hover:bg-gray-50/50">
                              <td className="py-2 px-4 border font-bold text-indigo-700" title={pi.description}>
                                {pi.id}
                              </td>
                              {programOutcomes.map((plo) => (
                                <td key={plo.id} className="p-2 border text-center">
                                  <input
                                    type="checkbox"
                                    checked={pi.alignments?.includes(plo.id)}
                                    onChange={() => {
                                      const current = pi.alignments || [];
                                      const updated = current.includes(plo.id)
                                        ? current.filter(x => x !== plo.id)
                                        : [...current, plo.id];
                                      updatePI(piIdx, "alignments", updated);
                                    }}
                                    className="w-4 h-4 text-[#800000] focus:ring-[#800000] border-gray-300 rounded cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section D: OBTL Weekly Plan Builder */}
        {activeSection === "D" && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">D. OBTL Weekly Instructional Calendar</h3>
                <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">Outcomes-Based Teaching & Learning Plan</p>
              </div>
              <button
                type="button"
                onClick={addWeek}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#800000]/20 hover:bg-[#800000]/5 text-[#800000] text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Week</span>
              </button>
            </div>

            {/* OBTL Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    {/* A. Title Row — not editable */}
                    <tr className="bg-[#800000]">
                      <th colSpan={9} className="py-3 px-5 text-center text-xs font-black uppercase tracking-widest text-white">
                        OUTCOMES-BASED TEACHING AND LEARNING PLAN (OBTL PLAN)
                      </th>
                    </tr>

                    {/* Main column group headers */}
                    <tr className="bg-gray-50 text-[9px] font-black uppercase text-gray-500 tracking-wider border-b border-gray-200 text-center">
                      {/* Week — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 w-16 align-middle">Week</th>
                      {/* DLOs — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 align-middle"><br />Desired Learning Outcomes (DLOs)</th>
                      {/* Learning Content — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 align-middle"><br />Learning Content / Topics</th>
                      {/* Instructional Delivery Design — spans 3 sub-columns */}
                      <th colSpan={3} className="py-2.5 px-3 border border-gray-200">Instructional Delivery Design</th>
                      {/* Assessment — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 align-middle"><br />Assessment</th>
                      {/* CLO Alignment — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 align-middle"><br />Alignment to CLOs</th>
                      {/* Actions — spans 3 header rows */}
                      <th rowSpan={3} className="py-2.5 px-3 border border-gray-200 w-12 align-middle"></th>
                    </tr>

                    {/* E sub-group headers: E.1 and E.2 */}
                    <tr className="bg-gray-50/70 text-[9px] font-bold uppercase text-gray-400 tracking-wider border-b border-gray-200 text-center">
                      {/* E.1 Face-to-face — spans 2 sub-header rows */}
                      <th rowSpan={2} className="border border-gray-200 py-1.5 px-2 align-middle"><br />Face-to-face</th>
                      {/* E.2 FLTAs — spans 2 sub-columns */}
                      <th colSpan={2} className="border border-gray-200 py-1.5 px-2">
                        Flexible Learning &amp; Teaching Activities (FLTAs)
                      </th>
                    </tr>

                    {/* E.2 sub-columns: E.2.1 and E.2.2 */}
                    <tr className="bg-gray-50/50 text-[8px] font-bold uppercase text-gray-400 tracking-wider border-b border-gray-200 text-center">
                      <th className="border border-gray-200 py-1.5 px-2"><br />Synchronous</th>
                      <th className="border border-gray-200 py-1.5 px-2"><br />Asynchronous</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700 bg-white">
                    {weeklyPlans.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-xs font-semibold text-gray-400">
                          No weekly plans yet. Click "+ Add Week" to begin building the OBTL plan.
                        </td>
                      </tr>
                    ) : (
                      weeklyPlans.map((plan, idx) => (
                        <tr key={idx} className={`hover:bg-gray-50/40 transition-colors align-top ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/20"}`}>

                          {/* B. Week */}
                          <td className="py-2.5 px-3 border border-gray-100 text-center align-middle">
                            <span className={`px-2 py-1 text-[10px] font-black rounded-lg inline-block ${idx % 2 === 0
                              ? "bg-[#800000]/10 text-[#800000]"
                              : "bg-amber-600/10 text-amber-700"
                              }`}>
                              {plan.week}
                            </span>
                          </td>

                          {/* C. Desired Learning Outcomes */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.desiredLearningOutcomes}
                              onChange={(e) => handleWeekChange(idx, "desiredLearningOutcomes", e.target.value)}
                              placeholder="Bloom's taxonomy learning outcomes..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* D. Learning Content / Topics */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.learningContent}
                              onChange={(e) => handleWeekChange(idx, "learningContent", e.target.value)}
                              placeholder="Topics, modules, chapter coverage..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* E.1 Face-to-face */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.faceFace}
                              onChange={(e) => handleWeekChange(idx, "faceFace", e.target.value)}
                              placeholder="In-person activities, lectures, labs..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* E.2.1 Synchronous */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.synchronous}
                              onChange={(e) => handleWeekChange(idx, "synchronous", e.target.value)}
                              placeholder="Live online sessions, virtual discussions..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* E.2.2 Asynchronous */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.asynchronous}
                              onChange={(e) => handleWeekChange(idx, "asynchronous", e.target.value)}
                              placeholder="Self-paced modules, recorded lectures, readings..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* F. Assessment */}
                          <td className="py-2 px-2 border border-gray-100">
                            <textarea
                              rows={3}
                              value={plan.assessments}
                              onChange={(e) => handleWeekChange(idx, "assessments", e.target.value)}
                              placeholder="Quizzes, lab outputs, performance tasks..."
                              className="w-full text-[11px] font-medium text-gray-700 bg-transparent border-0 focus:ring-0 resize-none p-0 placeholder-gray-300"
                            />
                          </td>

                          {/* G. CLO Alignment */}
                          <td className="py-2 px-2 border border-gray-100 align-top">
                            <div className="flex flex-wrap gap-1">
                              {courseOutcomes.length === 0 ? (
                                <span className="text-[9px] text-gray-300 italic">No CLOs defined</span>
                              ) : (
                                courseOutcomes.map((clo) => {
                                  const isAligned = plan.cloAlignment?.includes(clo.id);
                                  return (
                                    <button
                                      type="button"
                                      key={clo.id}
                                      onClick={() => {
                                        const current = plan.cloAlignment || [];
                                        const updated = isAligned
                                          ? current.filter(x => x !== clo.id)
                                          : [...current, clo.id];
                                        handleWeekChange(idx, "cloAlignment", updated);
                                      }}
                                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-all ${isAligned
                                        ? "bg-amber-700 border-amber-700 text-white"
                                        : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                                        }`}
                                    >
                                      {clo.id}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </td>

                          {/* Delete action */}
                          <td className="py-2 px-2 border border-gray-100 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => removeWeek(idx)}
                              className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* Section E: Grading System */}
        {activeSection === "E" && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">E. Academic Grading Parameters</h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-widest">Real-time cumulative evaluation validator</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Grading input builder */}
              <div className="space-y-4">
                <div className={`p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${isGradingValid
                  ? "bg-green-50/50 border-green-200 text-green-800"
                  : "bg-red-50/50 border-red-200 text-red-800"
                  }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest block text-gray-400">Total Breakdown</span>
                    <span className="text-2xl font-black">{totalGradingPercentage}%</span>
                  </div>

                  <div>
                    {isGradingValid ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-green-600 text-white rounded-lg flex items-center gap-1 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        <span>Valid (100%)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg flex items-center gap-1 shadow-sm">
                        <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                        <span>Must equal 100%</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {gradingComponents.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-xs font-semibold text-gray-400 bg-white">
                      No grading parameters defined. Click "Add Evaluation Category" to start.
                    </div>
                  ) : (
                    gradingComponents.map((gc, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          required
                          value={gc.name}
                          onChange={(e) => handleGradingChange(idx, "name", e.target.value)}
                          placeholder="e.g. Laboratory Exams, Assignments"
                          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 bg-white"
                        />

                        <div className="w-24 relative flex-shrink-0">
                          <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            value={gc.percentage}
                            onChange={(e) => handleGradingChange(idx, "percentage", e.target.value)}
                            className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-gray-200 text-xs font-black text-right focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/10 text-[#800000] bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeGradingComponent(idx)}
                          className="p-2 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={addGradingComponent}
                  className="w-full py-2.5 border border-dashed border-[#800000]/30 hover:border-[#800000] text-[#800000] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Evaluation Category</span>
                </button>
              </div>

              {/* Progress Ring display */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative w-44 h-44">
                  {/* SVG progress circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="stroke-gray-100 fill-transparent"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className={`fill-transparent transition-all duration-500 ${isGradingValid ? "stroke-green-500" : "stroke-[#800000]"
                        }`}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min(totalGradingPercentage, 100) / 100)}`}
                    />
                  </svg>

                  {/* Center metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-3xl font-black text-gray-800">{totalGradingPercentage}%</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Breakdown</span>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-400 font-semibold leading-relaxed max-w-xs">
                  Evaluation categories must map to course catalog assignments and equate to exactly 100%.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OCR Auto-fill Trigger Widget (always at bottom of active layout section to provide aid) */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <div className="space-y-1">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#800000]" />
              <span>Smart Printed OCR Syllabus Auto-fill</span>
            </span>
            <p className="text-[10px] text-gray-500 leading-relaxed max-w-xl font-medium">
              Have a screenshot of an existing syllabus? Upload it to auto-extract weekly outlines, outcomes parameters, and grading structures directly into this builder canvas.
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-[#800000]/30 hover:border-[#800000] hover:bg-[#800000]/5 text-[#800000] rounded-xl font-bold text-xs cursor-pointer transition-all">
            <ImageIcon className="w-4 h-4" />
            <span>Select Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleOcrUpload}
              disabled={ocrLoading}
              className="hidden"
            />
          </label>
        </div>

        {/* OCR loading status indicators */}
        {ocrLoading && (
          <div className="mt-4 p-4 border border-gray-100 rounded-xl bg-white space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>{ocrStatusText}</span>
              <span>{ocrProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#800000] transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        )}

        {!ocrLoading && ocrStatusText && (
          <div className={`mt-4 p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold ${ocrSuccess
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
            }`}>
            <Check className="w-4 h-4" />
            <span>{ocrStatusText}</span>
          </div>
        )}

        {/* Action Controls Bar Contained inside the Main Card */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="leading-tight">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Editing Status</span>
              <span className="text-xs font-bold text-gray-800 block mt-0.5">
                {syllabusId ? "Modifying existing draft" : "Designing new canvas"}
              </span>
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Stepper buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={navigatePrev}
                disabled={activeSection === "A"}
                className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={navigateNext}
                disabled={activeSection === "E"}
                className="p-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Validation error message warning if grading invalid */}
          {!isGradingValid && activeSection === "E" && (
            <span className="hidden md:flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>Cumulative grading must equal exactly 100% to submit</span>
            </span>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={submitting}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave("submitted")}
              disabled={submitting || !isGradingValid || !courseId}
              className="px-5 py-2.5 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-800/10 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Submit for Review</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, FileText, CheckCircle, AlertTriangle, Sparkles, Image as ImageIcon, Check } from "lucide-react";
import Tesseract from "tesseract.js";

export function SyllabusEditor({ syllabusId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cascading dropdown data
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");

  // Editor core state
  const [courseId, setCourseId] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState([{ description: "" }]);
  const [weeklyPlans, setWeeklyPlans] = useState([
    { week: 1, topic: "", activities: "", assessments: "", materials: "" }
  ]);
  const [gradingComponents, setGradingComponents] = useState([
    { name: "Midterm Exam", percentage: 30 },
    { name: "Final Exam", percentage: 30 },
    { name: "Quizzes", percentage: 20 },
    { name: "Class Participation", percentage: 20 }
  ]);

  // OCR Auto-fill state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState("");
  const [ocrSuccess, setOcrSuccess] = useState(false);

  // Fetch departments and courses
  useEffect(() => {
    const initData = async () => {
      try {
        const deptRes = await fetch("/api/departments");
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);

        const courseRes = await fetch("/api/courses");
        const courseData = await courseRes.json();
        setCourses(courseData.courses || []);

        // If editing, load syllabus details
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

            if (s.learning_outcomes?.length > 0) {
              setLearningOutcomes(s.learning_outcomes.map(o => ({ description: o.description })));
            }
            if (s.weekly_plans?.length > 0) {
              setWeeklyPlans(s.weekly_plans.map(p => ({
                week: p.week,
                topic: p.topic,
                activities: p.activities || "",
                assessments: p.assessments || "",
                materials: p.materials || ""
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
        console.error("Failed to load editor metadata:", err);
      }
      setLoading(false);
    };

    initData();
  }, [syllabusId]);

  // Filtered courses dropdown based on selected program/dept
  const filteredCoursesDropdown = selectedDept
    ? courses.filter(c => c.department_id === selectedDept)
    : courses;

  // 1. Learning Outcomes functions
  const addOutcome = () => setLearningOutcomes([...learningOutcomes, { description: "" }]);
  const removeOutcome = (index) => {
    const list = [...learningOutcomes];
    list.splice(index, 1);
    setLearningOutcomes(list);
  };
  const handleOutcomeChange = (index, value) => {
    const list = [...learningOutcomes];
    list[index].description = value;
    setLearningOutcomes(list);
  };

  // 2. Weekly Plans functions
  const addWeek = () => {
    const nextWeekNum = weeklyPlans.length + 1;
    setWeeklyPlans([...weeklyPlans, { week: nextWeekNum, topic: "", activities: "", assessments: "", materials: "" }]);
  };
  const removeWeek = (index) => {
    if (weeklyPlans.length === 1) return;
    const list = [...weeklyPlans];
    list.splice(index, 1);
    // Re-index week numbers
    const reindexed = list.map((item, i) => ({ ...item, week: i + 1 }));
    setWeeklyPlans(reindexed);
  };
  const handleWeekChange = (index, field, value) => {
    const list = [...weeklyPlans];
    list[index][field] = value;
    setWeeklyPlans(list);
  };

  // 3. Grading Components functions
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

  const totalGradingPercentage = gradingComponents.reduce((sum, item) => sum + item.percentage, 0);
  const isGradingValid = totalGradingPercentage === 100;

  // 4. Client-side Tesseract.js OCR Auto-fill
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrProgress(0);
    setOcrStatusText("Initializing character recognition engine...");
    setOcrSuccess(false);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrStatusText(`Extracting texts from document...`);
            setOcrProgress(Math.floor(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;
      setOcrStatusText("Analyzing document structure & segments...");
      
      // Perform intelligent regex parsing
      parseExtractedText(extractedText);
      
      setOcrSuccess(true);
      setOcrStatusText("Syllabus sections parsed and loaded successfully!");
    } catch (error) {
      console.error("OCR Extraction failed:", error);
      setOcrStatusText("OCR failed: Could not read characters clearly.");
    }
    setOcrLoading(false);
  };

  const parseExtractedText = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    
    // 1. Try to find Learning Outcomes
    // Find keywords like "outcomes", "course objectives", "intended learning"
    let outcomesFound = [];
    let parsingOutcomes = false;

    // 2. Try to find Weekly schedule
    // Find lines matching "Week 1", "Week 2", etc.
    let weeklyFound = [];

    // 3. Try to find Grading system
    let gradingFound = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      // Outcomes Section
      if (lowerLine.includes("outcomes") || lowerLine.includes("objectives") || lowerLine.includes("intended learning")) {
        parsingOutcomes = true;
        continue;
      }
      
      if (parsingOutcomes) {
        // Stop outcomes parsing if we hit another header
        if (lowerLine.includes("week") || lowerLine.includes("schedule") || lowerLine.includes("grading") || lowerLine.includes("evaluation")) {
          parsingOutcomes = false;
        } else {
          // Check if line looks like an item (starts with bullet, digit, etc.)
          const cleanDesc = line.replace(/^([•\-\*\d\.\)\s]+)/, "").trim();
          if (cleanDesc.length > 15) {
            outcomesFound.push({ description: cleanDesc });
          }
        }
      }

      // Schedule parsing
      const weekMatch = line.match(/Week\s*(\d+)/i);
      if (weekMatch) {
        const weekNum = parseInt(weekMatch[1]);
        // Extract rest of text or next line as topic
        const topicCandidate = line.replace(weekMatch[0], "").replace(/^[:\-,\s]+/, "").trim();
        const nextLine = lines[i + 1] || "";
        const topic = topicCandidate.length > 5 ? topicCandidate : nextLine;
        
        weeklyFound.push({
          week: weekNum,
          topic: topic || `Syllabus Topic Week ${weekNum}`,
          activities: "Lecture and Group Discussion",
          assessments: "Module Quiz",
          materials: "Slide presentations"
        });
      }

      // Grading percentages matching (e.g. Quizzes 20%, Exam - 30%)
      const pctMatch = line.match(/([a-zA-Z\s]+)[-:]?\s*(\d+)\s*%/);
      if (pctMatch) {
        const name = pctMatch[1].trim();
        const pct = parseInt(pctMatch[2]);
        if (name.length > 3 && pct > 0 && pct < 100) {
          gradingFound.push({ name, percentage: pct });
        }
      }
    }

    // Apply outcomes
    if (outcomesFound.length > 0) {
      setLearningOutcomes(outcomesFound);
    }
    
    // Apply weeks
    if (weeklyFound.length > 0) {
      // Sort weeks properly
      weeklyFound.sort((a, b) => a.week - b.week);
      // Re-index sequentially to avoid gaps
      const sequentialWeeks = weeklyFound.map((item, idx) => ({ ...item, week: idx + 1 }));
      setWeeklyPlans(sequentialWeeks);
    }

    // Apply grading
    if (gradingFound.length > 0) {
      // Ensure we don't have duplicated entries and total percentages sum up nicely
      const totalParsed = gradingFound.reduce((sum, item) => sum + item.percentage, 0);
      if (totalParsed <= 100) {
        setGradingComponents(gradingFound);
      }
    }
  };

  // 5. Submit Handler
  const handleSave = async (statusType) => {
    if (!courseId) {
      alert("Please select a Program and corresponding Course first.");
      return;
    }

    if (statusType === "submitted" && !isGradingValid) {
      alert("Submission blocked. Cumulative grading percentages must sum to exactly 100%.");
      return;
    }

    // Clean data
    const payload = {
      courseId,
      status: statusType,
      learningOutcomes: learningOutcomes.filter(o => o.description.trim() !== ""),
      weeklyPlans: weeklyPlans.filter(p => p.topic.trim() !== ""),
      gradingComponents: gradingComponents.filter(g => g.name.trim() !== "")
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
        const err = await res.json();
        alert(err.error || "Failed to save syllabus.");
      }
    } catch (e) {
      console.error("Save error:", e);
      alert("Network error.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Initializing Syllabus Editor workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and top buttons */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#800000]" />
            <span>{syllabusId ? "Edit Course Syllabus" : "Design New Syllabus"}</span>
          </h3>
          <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Outcomes-Based Planning Canvas</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={submitting}
            className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={() => handleSave("submitted")}
            disabled={submitting || !isGradingValid}
            className="px-4 py-2.5 bg-[#800000] hover:bg-red-900 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-800/10 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit for Review</span>
          </button>
        </div>
      </div>

      {/* OCR Auto-fill Widget */}
      <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6 relative overflow-hidden bg-gradient-to-r from-white via-white to-red-50/10">
        <div className="absolute right-0 top-0 w-16 h-16 bg-[#800000]/5 rounded-full blur-xl" />
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-1 max-w-xl">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart OCR Syllabus Import</span>
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Have an existing printed or digital syllabus screenshot? Upload it here. Our client-side character recognition engine will extract weekly schedules, learning outcomes, and grading configurations to auto-fill this canvas.
            </p>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <label className="flex items-center justify-center gap-2 px-5 py-3 border border-dashed border-[#800000]/30 hover:border-[#800000] hover:bg-[#800000]/5 text-[#800000] rounded-2xl font-bold text-xs cursor-pointer transition-all">
              <ImageIcon className="w-4.5 h-4.5" />
              <span>Upload Syllabus Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleOcrUpload}
                disabled={ocrLoading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* OCR Status/Progress indicator */}
        {ocrLoading && (
          <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
              <span>{ocrStatusText}</span>
              <span>{ocrProgress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#800000] transition-all duration-300"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </div>
        )}

        {!ocrLoading && ocrStatusText && (
          <div className={`mt-4 p-3 border rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
            ocrSuccess 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {ocrSuccess ? <Check className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
            <span>{ocrStatusText}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Syllabus Data Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section A: Course Selector */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3">A. Course Identification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Academic Program / Dept</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setCourseId("");
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white"
                >
                  <option value="">Select a Program</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Associated Course</label>
                <select
                  value={courseId}
                  disabled={!selectedDept}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 bg-white disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  {filteredCoursesDropdown.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title} ({c.units} Units)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section B: Learning Outcomes */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">B. Intended Learning Outcomes</h4>
              <button
                type="button"
                onClick={addOutcome}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 hover:bg-red-50 text-[#800000] text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Outcome</span>
              </button>
            </div>

            <div className="space-y-3">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-extrabold text-[#800000] text-xs w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    value={outcome.description}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    placeholder="Describe what students will learn or be able to demonstrate upon course completion..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeOutcome(idx)}
                    disabled={learningOutcomes.length === 1}
                    className="p-2 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Weekly Schedule */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">C. Weekly Instructional Calendar</h4>
              <button
                type="button"
                onClick={addWeek}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 hover:bg-red-50 text-[#800000] text-xs font-bold rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Week</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {weeklyPlans.map((plan, idx) => (
                <div key={idx} className="p-4 border border-gray-100 rounded-2xl bg-gray-50/20 relative space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-[#800000] uppercase tracking-wider">Week {plan.week} Schedule</span>
                    <button
                      type="button"
                      onClick={() => removeWeek(idx)}
                      disabled={weeklyPlans.length === 1}
                      className="p-1 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Topic / Lesson Subject</label>
                      <input
                        type="text"
                        required
                        value={plan.topic}
                        onChange={(e) => handleWeekChange(idx, "topic", e.target.value)}
                        placeholder="e.g. Introduction to Variables"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Classroom Activities</label>
                      <input
                        type="text"
                        value={plan.activities}
                        onChange={(e) => handleWeekChange(idx, "activities", e.target.value)}
                        placeholder="e.g. Programming lab demo, group debugging"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Assessments / Evidences</label>
                      <input
                        type="text"
                        value={plan.assessments}
                        onChange={(e) => handleWeekChange(idx, "assessments", e.target.value)}
                        placeholder="e.g. Short diagnostic quiz, array coding lab"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Materials & References</label>
                      <input
                        type="text"
                        value={plan.materials}
                        onChange={(e) => handleWeekChange(idx, "materials", e.target.value)}
                        placeholder="e.g. C++ Programming Handbook, Chapter 2"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Grading Validator Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-3">D. Grading Configuration</h4>

            {/* Total Percentage Validator Banner */}
            <div className={`p-4 border rounded-2xl flex items-center justify-between transition-all duration-300 ${
              isGradingValid 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest block">Cumulative Percent</span>
                <span className="text-2xl font-black">{totalGradingPercentage}%</span>
              </div>
              <div className="text-right">
                {isGradingValid ? (
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-green-600 text-white rounded-lg flex items-center gap-1 shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    <span>Exact (100%)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-600 text-white rounded-lg flex items-center gap-1 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Incomplete</span>
                  </span>
                )}
              </div>
            </div>

            {/* List of grading fields */}
            <div className="space-y-3">
              {gradingComponents.map((gc, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={gc.name}
                    onChange={(e) => handleGradingChange(idx, "name", e.target.value)}
                    placeholder="e.g. Quizzes"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-gray-800 bg-white"
                  />
                  <div className="w-20 relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={gc.percentage}
                      onChange={(e) => handleGradingChange(idx, "percentage", e.target.value)}
                      className="w-full pr-7 pl-3 py-2 rounded-lg border border-gray-200 text-xs font-black text-right focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/10 text-[#800000] bg-white"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-gray-400">%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGradingComponent(idx)}
                    disabled={gradingComponents.length === 1}
                    className="p-2 border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addGradingComponent}
              className="w-full py-2.5 border border-dashed border-[#800000]/30 hover:border-[#800000] text-[#800000] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evaluation Component</span>
            </button>
          </div>

          {/* Guidelines info card */}
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs text-gray-500 leading-relaxed font-medium space-y-2">
            <span className="font-bold text-gray-800 uppercase block tracking-wider text-[10px]">Academic Standards</span>
            <p>1. Learning Outcomes should utilize standard active verbs from Bloom's Taxonomy.</p>
            <p>2. Weekly calendar topics must match the official course catalog parameters.</p>
            <p>3. Submit for Review will place the syllabus in a locked status, making it readable to branch administrators for evaluation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

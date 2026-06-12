import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const programId = searchParams.get("programId") || searchParams.get("departmentId") || "";
    const courseId = searchParams.get("courseId") || "";

    let query = supabase
      .from("syllabi")
      .select(`
        id, course_id, instructor_id, status, version, updated_at,
        courses ( id, code, title, units, program_id ),
        users ( id, full_name, email )
      `)
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (instructorId) {
      query = query.eq("instructor_id", instructorId);
    }
    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data: syllabiData, error } = await query;
    if (error) throw error;

    let syllabi = syllabiData.map(s => ({
      id: s.id,
      course_id: s.course_id,
      instructor_id: s.instructor_id,
      status: s.status,
      version: s.version,
      updated_at: s.updated_at,
      code: s.courses?.code,
      course_title: s.courses?.title,
      units: s.courses?.units,
      program_id: s.courses?.program_id,
      instructor_name: s.users?.full_name,
      instructor_email: s.users?.email
    }));

    if (programId) {
      syllabi = syllabi.filter(s => s.program_id === programId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      syllabi = syllabi.filter(s => 
        (s.code?.toLowerCase().includes(searchLower) || s.course_title?.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({ syllabi });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const instructorId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

    if (!instructorId) {
      return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 419 });
    }

    const {
      courseId,
      status,
      learningOutcomes,
      weeklyPlans,
      gradingComponents,
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
      campusGoals
    } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course selection is required." }, { status: 400 });
    }

    const syllabusId = crypto.randomUUID();

    // 1. Insert Syllabus metadata
    const { error: syllabusError } = await supabase.from("syllabi").insert([{
      id: syllabusId,
      course_id: courseId,
      instructor_id: instructorId,
      status: status || "draft",
      version: 1,
      course_description: courseDescription || "",
      prerequisites: prerequisites || "",
      corequisites: corequisites || "",
      semester: semester || "",
      academic_year: academicYear || "",
      vision: vision || "",
      mission: mission || "",
      quality_policy: qualityPolicy || "",
      institutional_outcomes: institutionalOutcomes || [],
      program_outcomes: programOutcomes || [],
      course_outcomes: courseOutcomes || [],
      performance_indicators: performanceIndicators || [],
      campus_goals: campusGoals || []
    }]);

    if (syllabusError) throw syllabusError;

    // 2. Insert Learning Outcomes
    if (learningOutcomes && learningOutcomes.length > 0) {
      const outcomesToInsert = learningOutcomes.map((lo, index) => ({
        id: crypto.randomUUID(),
        syllabus_id: syllabusId,
        description: lo.description,
        order_index: index + 1
      }));
      const { error: loError } = await supabase.from("learning_outcomes").insert(outcomesToInsert);
      if (loError) throw loError;
    }

    // 3. Insert Weekly Plans
    if (weeklyPlans && weeklyPlans.length > 0) {
      const plansToInsert = weeklyPlans.map((p, index) => ({
        id: crypto.randomUUID(),
        syllabus_id: syllabusId,
        week: p.week,
        topic: p.topic,
        activities: p.activities || "",
        assessments: p.assessments || "",
        materials: p.materials || "",
        order_index: index + 1,
        desired_learning_outcomes: p.desiredLearningOutcomes || "",
        clo_alignment: p.cloAlignment || [],
        learning_content: p.learningContent || "",
        face_face: p.faceFace || "",
        synchronous: p.synchronous || "",
        asynchronous: p.asynchronous || ""
      }));
      const { error: wpError } = await supabase.from("weekly_plans").insert(plansToInsert);
      if (wpError) throw wpError;
    }

    // 4. Insert Grading Components
    if (gradingComponents && gradingComponents.length > 0) {
      const gradingToInsert = gradingComponents.map((g, index) => ({
        id: crypto.randomUUID(),
        syllabus_id: syllabusId,
        name: g.name,
        percentage: g.percentage,
        order_index: index + 1
      }));
      const { error: gcError } = await supabase.from("grading_components").insert(gradingToInsert);
      if (gcError) throw gcError;
    }

    return NextResponse.json({ success: true, syllabusId });
  } catch (error) {
    console.error("POST Syllabus API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

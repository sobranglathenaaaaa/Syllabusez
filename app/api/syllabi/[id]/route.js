import { supabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. Get syllabus metadata
    const { data: syllabi, error } = await supabase
      .from("syllabi")
      .select(`
        id, course_id, instructor_id, status, version, approval_comment, updated_at,
        course_description, prerequisites, corequisites, semester, academic_year,
        vision, mission, quality_policy, institutional_outcomes,
        program_outcomes, course_outcomes, performance_indicators, campus_goals,
        courses ( id, code, title, units, program_id ),
        users ( id, full_name, email )
      `)
      .eq("id", id)
      .single();

    if (error || !syllabi) {
      return NextResponse.json({ error: "Syllabus not found" }, { status: 404 });
    }

    const syllabus = {
      ...syllabi,
      code: syllabi.courses?.code,
      title: syllabi.courses?.title,
      units: syllabi.courses?.units,
      program_id: syllabi.courses?.program_id,
      instructor_name: syllabi.users?.full_name,
      instructor_email: syllabi.users?.email
    };

    delete syllabus.courses;
    delete syllabus.users;

    // 2. Get Learning Outcomes
    const { data: outcomes } = await supabase
      .from("learning_outcomes")
      .select("id, description, order_index")
      .eq("syllabus_id", id)
      .order("order_index", { ascending: true });

    // 3. Get Weekly Plans
    const { data: plans } = await supabase
      .from("weekly_plans")
      .select(`
        id, week, topic, activities, assessments, materials, order_index, 
        desired_learning_outcomes, clo_alignment
      `)
      .eq("syllabus_id", id)
      .order("week", { ascending: true })
      .order("order_index", { ascending: true });

    // 4. Get Grading Components
    const { data: components } = await supabase
      .from("grading_components")
      .select("id, name, percentage, order_index")
      .eq("syllabus_id", id)
      .order("order_index", { ascending: true });

    // Pack details
    syllabus.learning_outcomes = outcomes || [];
    syllabus.weekly_plans = plans || [];
    syllabus.grading_components = components || [];

    // Supabase pg driver returns JSONB automatically as objects, no need to JSON.parse!
    syllabus.institutional_outcomes = syllabus.institutional_outcomes || [];
    syllabus.program_outcomes = syllabus.program_outcomes || [];
    syllabus.course_outcomes = syllabus.course_outcomes || [];
    syllabus.performance_indicators = syllabus.performance_indicators || [];
    syllabus.campus_goals = syllabus.campus_goals || [];

    syllabus.weekly_plans.forEach(p => {
      p.clo_alignment = p.clo_alignment || [];
    });

    return NextResponse.json({ syllabus });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const instructorId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

    if (!instructorId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 419 });
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
      return NextResponse.json({ error: "Course is required." }, { status: 400 });
    }

    // 1. Check if exists and retrieve current version
    const { data: current, error: checkError } = await supabase
      .from("syllabi")
      .select("status, version")
      .eq("id", id)
      .single();

    if (checkError || !current) {
      return NextResponse.json({ error: "Syllabus does not exist" }, { status: 404 });
    }

    let newVersion = current.version;
    if (current.status === "approved" && status === "submitted") {
      newVersion = current.version + 1;
    }

    // 2. Update parent syllabus metadata
    const { error: updateError } = await supabase.from("syllabi").update({
      course_id: courseId,
      status: status || "draft",
      version: newVersion,
      approval_comment: null,
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
    }).eq("id", id);

    if (updateError) throw updateError;

    // 3. Clear old child rows
    await supabase.from("learning_outcomes").delete().eq("syllabus_id", id);
    await supabase.from("weekly_plans").delete().eq("syllabus_id", id);
    await supabase.from("grading_components").delete().eq("syllabus_id", id);

    // 4. Re-insert Learning Outcomes
    if (learningOutcomes && learningOutcomes.length > 0) {
      const loInserts = learningOutcomes.map((lo, i) => ({
        id: crypto.randomUUID(), syllabus_id: id, description: lo.description, order_index: i + 1
      }));
      await supabase.from("learning_outcomes").insert(loInserts);
    }

    // 5. Re-insert Weekly Plans
    if (weeklyPlans && weeklyPlans.length > 0) {
      const wpInserts = weeklyPlans.map((p, i) => ({
        id: crypto.randomUUID(),
        syllabus_id: id,
        week: p.week,
        topic: p.topic,
        activities: p.activities || "",
        assessments: p.assessments || "",
        materials: p.materials || "",
        order_index: i + 1,
        desired_learning_outcomes: p.desiredLearningOutcomes || "",
        clo_alignment: p.cloAlignment || []
      }));
      await supabase.from("weekly_plans").insert(wpInserts);
    }

    // 6. Re-insert Grading Components
    if (gradingComponents && gradingComponents.length > 0) {
      const gcInserts = gradingComponents.map((g, i) => ({
        id: crypto.randomUUID(),
        syllabus_id: id,
        name: g.name,
        percentage: g.percentage,
        order_index: i + 1
      }));
      await supabase.from("grading_components").insert(gcInserts);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Syllabus API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

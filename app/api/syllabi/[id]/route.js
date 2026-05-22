import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. Get syllabus metadata (with modern fields)
    const syllabi = await query(
      `SELECT s.id, s.course_id, s.instructor_id, s.status, s.version, s.approval_comment, s.updated_at,
              s.course_description, s.prerequisites, s.corequisites, s.semester, s.academic_year,
              s.vision, s.mission, s.quality_policy, s.institutional_outcomes,
              s.program_outcomes, s.course_outcomes, s.performance_indicators,
              c.code, c.title, c.units, c.department_id,
              p.full_name as instructor_name, p.email as instructor_email
       FROM syllabi s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN users p ON s.instructor_id = p.id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    );

    const syllabus = syllabi[0];
    if (!syllabus) {
      return NextResponse.json({ error: "Syllabus not found" }, { status: 404 });
    }

    // 2. Get Learning Outcomes
    const outcomes = await query(
      "SELECT id, description, order_index FROM learning_outcomes WHERE syllabus_id = ? ORDER BY order_index ASC",
      [id]
    );

    // 3. Get Weekly Plans
    const plans = await query(
      `SELECT id, week, topic, activities, assessments, materials, order_index, 
              desired_learning_outcomes, clo_alignment 
       FROM weekly_plans 
       WHERE syllabus_id = ? 
       ORDER BY week ASC, order_index ASC`,
      [id]
    );

    // 4. Get Grading Components
    const components = await query(
      "SELECT id, name, percentage, order_index FROM grading_components WHERE syllabus_id = ? ORDER BY order_index ASC",
      [id]
    );

    // Parse JSON columns in metadata if they are strings
    try {
      syllabus.institutional_outcomes = syllabus.institutional_outcomes ? JSON.parse(syllabus.institutional_outcomes) : [];
    } catch {
      syllabus.institutional_outcomes = [];
    }
    try {
      syllabus.program_outcomes = syllabus.program_outcomes ? JSON.parse(syllabus.program_outcomes) : [];
    } catch {
      syllabus.program_outcomes = [];
    }
    try {
      syllabus.course_outcomes = syllabus.course_outcomes ? JSON.parse(syllabus.course_outcomes) : [];
    } catch {
      syllabus.course_outcomes = [];
    }
    try {
      syllabus.performance_indicators = syllabus.performance_indicators ? JSON.parse(syllabus.performance_indicators) : [];
    } catch {
      syllabus.performance_indicators = [];
    }

    // Parse week alignments
    plans.forEach(p => {
      try {
        p.clo_alignment = p.clo_alignment ? JSON.parse(p.clo_alignment) : [];
      } catch {
        p.clo_alignment = [];
      }
    });

    // Pack details
    syllabus.learning_outcomes = outcomes;
    syllabus.weekly_plans = plans;
    syllabus.grading_components = components;

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
      performanceIndicators
    } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course is required." }, { status: 400 });
    }

    // 1. Check if exists and retrieve current version
    const currentRows = await query("SELECT status, version FROM syllabi WHERE id = ? LIMIT 1", [id]);
    const current = currentRows[0];
    if (!current) {
      return NextResponse.json({ error: "Syllabus does not exist" }, { status: 404 });
    }

    // Determine new version (if approved and re-edited, increment version. Otherwise keep current)
    let newVersion = current.version;
    if (current.status === "approved" && status === "submitted") {
      newVersion = current.version + 1;
    }

    // 2. Update parent syllabus metadata
    await query(
      `UPDATE syllabi SET 
        course_id = ?, status = ?, version = ?, approval_comment = NULL, updated_at = CURRENT_TIMESTAMP,
        course_description = ?, prerequisites = ?, corequisites = ?, semester = ?, academic_year = ?,
        vision = ?, mission = ?, quality_policy = ?, institutional_outcomes = ?,
        program_outcomes = ?, course_outcomes = ?, performance_indicators = ?
       WHERE id = ?`,
      [
        courseId,
        status || "draft",
        newVersion,
        courseDescription || "",
        prerequisites || "",
        corequisites || "",
        semester || "",
        academicYear || "",
        vision || "",
        mission || "",
        qualityPolicy || "",
        JSON.stringify(institutionalOutcomes || []),
        JSON.stringify(programOutcomes || []),
        JSON.stringify(courseOutcomes || []),
        JSON.stringify(performanceIndicators || []),
        id
      ]
    );

    // 3. Clear old child rows
    await query("DELETE FROM learning_outcomes WHERE syllabus_id = ?", [id]);
    await query("DELETE FROM weekly_plans WHERE syllabus_id = ?", [id]);
    await query("DELETE FROM grading_components WHERE syllabus_id = ?", [id]);

    // 4. Re-insert Learning Outcomes
    if (learningOutcomes && learningOutcomes.length > 0) {
      for (let i = 0; i < learningOutcomes.length; i++) {
        await query(
          "INSERT INTO learning_outcomes (id, syllabus_id, description, order_index) VALUES (?, ?, ?, ?)",
          [crypto.randomUUID(), id, learningOutcomes[i].description, i + 1]
        );
      }
    }

    // 5. Re-insert Weekly Plans
    if (weeklyPlans && weeklyPlans.length > 0) {
      for (let i = 0; i < weeklyPlans.length; i++) {
        const p = weeklyPlans[i];
        await query(
          "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index, desired_learning_outcomes, clo_alignment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            crypto.randomUUID(),
            id,
            p.week,
            p.topic,
            p.activities || "",
            p.assessments || "",
            p.materials || "",
            i + 1,
            p.desiredLearningOutcomes || "",
            JSON.stringify(p.cloAlignment || [])
          ]
        );
      }
    }

    // 6. Re-insert Grading Components
    if (gradingComponents && gradingComponents.length > 0) {
      for (let i = 0; i < gradingComponents.length; i++) {
        const g = gradingComponents[i];
        await query(
          "INSERT INTO grading_components (id, syllabus_id, name, percentage, order_index) VALUES (?, ?, ?, ?, ?)",
          [crypto.randomUUID(), id, g.name, g.percentage, i + 1]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT Syllabus API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

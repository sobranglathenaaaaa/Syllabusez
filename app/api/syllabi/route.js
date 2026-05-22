import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const courseId = searchParams.get("courseId") || "";

    let sql = `
      SELECT s.id, s.course_id, s.instructor_id, s.status, s.version, s.updated_at,
             c.code, c.title as course_title, c.units, c.department_id,
             p.full_name as instructor_name, p.email as instructor_email
      FROM syllabi s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN users p ON s.instructor_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (c.code LIKE ? OR c.title LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += " AND s.status = ?";
      params.push(status);
    }

    if (instructorId) {
      sql += " AND s.instructor_id = ?";
      params.push(instructorId);
    }

    if (departmentId) {
      sql += " AND c.department_id = ?";
      params.push(departmentId);
    }

    if (courseId) {
      sql += " AND s.course_id = ?";
      params.push(courseId);
    }

    sql += " ORDER BY s.updated_at DESC";

    const syllabi = await query(sql, params);
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
      performanceIndicators
    } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: "Course selection is required." }, { status: 400 });
    }

    const syllabusId = crypto.randomUUID();

    // 1. Insert Syllabus metadata
    await query(
      `INSERT INTO syllabi (
        id, course_id, instructor_id, status, version,
        course_description, prerequisites, corequisites, semester, academic_year,
        vision, mission, quality_policy, institutional_outcomes,
        program_outcomes, course_outcomes, performance_indicators
      ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        syllabusId,
        courseId,
        instructorId,
        status || "draft",
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
        JSON.stringify(performanceIndicators || [])
      ]
    );

    // 2. Insert Learning Outcomes
    if (learningOutcomes && learningOutcomes.length > 0) {
      for (let i = 0; i < learningOutcomes.length; i++) {
        await query(
          "INSERT INTO learning_outcomes (id, syllabus_id, description, order_index) VALUES (?, ?, ?, ?)",
          [crypto.randomUUID(), syllabusId, learningOutcomes[i].description, i + 1]
        );
      }
    }

    // 3. Insert Weekly Plans
    if (weeklyPlans && weeklyPlans.length > 0) {
      for (let i = 0; i < weeklyPlans.length; i++) {
        const p = weeklyPlans[i];
        await query(
          "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index, desired_learning_outcomes, clo_alignment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            crypto.randomUUID(),
            syllabusId,
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

    // 4. Insert Grading Components
    if (gradingComponents && gradingComponents.length > 0) {
      for (let i = 0; i < gradingComponents.length; i++) {
        const g = gradingComponents[i];
        await query(
          "INSERT INTO grading_components (id, syllabus_id, name, percentage, order_index) VALUES (?, ?, ?, ?, ?)",
          [crypto.randomUUID(), syllabusId, g.name, g.percentage, i + 1]
        );
      }
    }

    return NextResponse.json({ success: true, syllabusId });
  } catch (error) {
    console.error("POST Syllabus API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

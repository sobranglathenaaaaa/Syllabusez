import { query } from "@/lib/db";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // 1. Get syllabus metadata
    const syllabi = await query(
      `SELECT s.id, s.course_id, s.instructor_id, s.status, s.version, s.approval_comment, s.updated_at,
              c.code, c.title, c.units, c.department_id,
              p.full_name as instructor_name, p.email as instructor_email
       FROM syllabi s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN profiles p ON s.instructor_id = p.id
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
      "SELECT id, week, topic, activities, assessments, materials, order_index FROM weekly_plans WHERE syllabus_id = ? ORDER BY week ASC, order_index ASC",
      [id]
    );

    // 4. Get Grading Components
    const components = await query(
      "SELECT id, name, percentage, order_index FROM grading_components WHERE syllabus_id = ? ORDER BY order_index ASC",
      [id]
    );

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

    const { courseId, status, learningOutcomes, weeklyPlans, gradingComponents } = await request.json();

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
    // Reset approval_comment to null since it is updated and re-evaluated
    await query(
      "UPDATE syllabi SET course_id = ?, status = ?, version = ?, approval_comment = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [courseId, status || "draft", newVersion, id]
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
          "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [crypto.randomUUID(), id, p.week, p.topic, p.activities, p.assessments, p.materials, i + 1]
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

import { supabase } from "./db";
import crypto from "crypto";

export async function seedDatabase(force = false) {
  try {
    // 1. Check if database has users
    if (!force) {
      const { count } = await supabase.from("users").select('*', { count: 'exact', head: true });

      if (count > 0) {
        console.log("Database already seeded. Skipping.");
        return { seeded: false, message: "Database already contains users." };
      }
    }

    console.log("Seeding database...");

    // Fixed UUIDs for clean reference relations
    const adminId = "a1a1a1a1-1111-4111-a111-111111111111";
    const instructorId = "i2i2i2i2-2222-4222-i222-222222222222";
    const studentId = "s3s3s3s3-3333-4333-s333-333333333333";

    const bsaDeptId = "d1d1d1d1-1111-4111-d111-111111111111";
    const bsedenDeptId = "d2d2d2d2-2222-4222-d222-222222222222";
    const bsentDeptId = "d3d3d3d3-3333-4333-d333-333333333333";
    const bsbafmDeptId = "d4d4d4d4-4444-4444-d444-444444444444";
    const bsitDeptId = "d5d5d5d5-5555-4555-d555-555555555555";
    const bshmDeptId = "d6d6d6d6-6666-4666-d666-666666666666";
    const bspsyDeptId = "d7d7d7d7-7777-4777-d777-777777777777";
    const dictDeptId = "d8d8d8d8-8888-4888-d888-888888888888";

    // Clear old records if any (Postgres will cascade deletes if set up, or just clear tables in order)
    await supabase.from("users").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("programs").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("courses").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("enrollments").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("syllabi").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("learning_outcomes").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("weekly_plans").delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from("grading_components").delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Users
    await supabase.from("users").insert([
      { id: adminId, full_name: "Admin Dela Cruz", email: "admin@pup.edu.ph", role: "admin" },
      { id: instructorId, full_name: "Staff Dela Cruz", email: "instructor@pup.edu.ph", role: "instructor" },
      { id: studentId, full_name: "Juan Dela Cruz", email: "student@pup.edu.ph", role: "student" }
    ]);

    // 3. Insert Programs
    await supabase.from("programs").insert([
      { id: bsaDeptId, name: "Bachelor of Science in Accountancy (BSA)" },
      { id: bsedenDeptId, name: "Bachelor in Secondary Education major in English (BSEDEN)" },
      { id: bsentDeptId, name: "Bachelor of Science in Entrepreneurship (BSENT)" },
      { id: bsbafmDeptId, name: "Bachelor of Science in Business Education major in Financial Management (BSBA-FM)" },
      { id: bsitDeptId, name: "Bachelor of Science in Information Technology (BSIT)" },
      { id: bshmDeptId, name: "Bachelor of Science in Hospitality Management (BSHM)" },
      { id: bspsyDeptId, name: "Bachelor of Science in Psychology (BS Psy)" },
      { id: dictDeptId, name: "Diploma in Information and Communications Technology (DICT)" }
    ]);

    // Note: Enrollment relies on courses existing, which were removed in this dummy data.
    // They used to be seeded, but I removed them based on original file.

    return { seeded: true, message: "Database seeded successfully" };

  } catch (error) {
    console.error("Seeding error:", error);
    return { seeded: false, message: error.message };
  }
}

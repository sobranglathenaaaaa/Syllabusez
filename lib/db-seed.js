import { query } from "./db";

export async function seedDatabase(force = false) {
  try {
    // 1. Check if database has users
    if (!force) {
      const profileCountRows = await query("SELECT COUNT(*) as count FROM users");
      const profileCount = profileCountRows[0]?.count || 0;

      if (profileCount > 0) {
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

    const comp001Id = "c1c1c1c1-1111-4111-c111-111111111111";
    const comp002Id = "c2c2c2c2-2222-4222-c222-222222222222";
    const comp006Id = "c3c3c3c3-3333-4333-c333-333333333333";
    const comp003Id = "c4c4c4c4-4444-4444-c444-444444444444";
    const geed032Id = "e1e1e1e1-1111-4111-e111-111111111111";
    const geed005Id = "e2e2e2e2-2222-4222-e222-222222222222";

    const syllabusCCIS101 = "b1b1b1b1-1111-4111-b111-111111111111";
    const syllabusCCIS102 = "b2b2b2b2-2222-4222-b222-222222222222";
    const syllabusCCIS103 = "b3b3b3b3-3333-4333-b333-333333333333";

    // Disable foreign key checks temporarily to prevent order constraint errors
    await query("SET FOREIGN_KEY_CHECKS = 0");

    // Clear old records if any
    await query("DELETE FROM users");
    await query("DELETE FROM programs");
    await query("DELETE FROM courses");
    await query("DELETE FROM enrollments");
    await query("DELETE FROM syllabi");
    await query("DELETE FROM learning_outcomes");
    await query("DELETE FROM weekly_plans");
    await query("DELETE FROM grading_components");

    // 2. Insert Users
    await query(
      "INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [adminId, "Admin Dela Cruz", "admin@pup.edu.ph", "admin"]
    );
    await query(
      "INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [instructorId, "Staff Dela Cruz", "instructor@pup.edu.ph", "instructor"]
    );
    await query(
      "INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [studentId, "Juan Dela Cruz", "student@pup.edu.ph", "student"]
    );

    // 3. Insert Programs
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bsaDeptId, "Bachelor of Science in Accountancy (BSA)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bsedenDeptId, "Bachelor in Secondary Education major in English (BSEDEN)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bsentDeptId, "Bachelor of Science in Entrepreneurship (BSENT)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bsbafmDeptId, "Bachelor of Science in Business Education major in Financial Management (BSBA-FM)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bsitDeptId, "Bachelor of Science in Information Technology (BSIT)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bshmDeptId, "Bachelor of Science in Hospitality Management (BSHM)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [bspsyDeptId, "Bachelor of Science in Psychology (BS Psy)"]);
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [dictDeptId, "Diploma in Information and Communications Technology (DICT)"]);

    // 4. Insert Courses
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [comp001Id, "COMP 001", "Introduction to Computing", 3, bsitDeptId]
    );
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [comp002Id, "COMP 002", "Computer Programming 1", 3, bsitDeptId]
    );
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [comp006Id, "COMP 006", "Data Structures and Algorithms", 3, bsitDeptId]
    );
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [comp003Id, "COMP 003", "Computer Programming 2", 3, bsitDeptId]
    );
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [geed032Id, "GEED 032", "Filipinolohiya at Pambansang Kaunlaran", 3, bsitDeptId]
    );
    await query(
      "INSERT INTO courses (id, code, title, units, program_id) VALUES (?, ?, ?, ?, ?)",
      [geed005Id, "GEED 005", "Purposive Communication", 3, bsitDeptId]
    );

    // 5. Enroll Student in Courses
    await query(
      "INSERT INTO enrollments (id, user_id, course_id) VALUES (uuid(), ?, ?), (uuid(), ?, ?), (uuid(), ?, ?), (uuid(), ?, ?)",
      [studentId, comp001Id, studentId, comp002Id, studentId, comp006Id, studentId, geed032Id]
    );

    } catch (error) {
        console.error("Seeding error:", error);
        return { seeded: false, message: error.message };
    } finally {
        // Re-enable foreign key checks
        await query("SET FOREIGN_KEY_CHECKS = 1");
    }
}

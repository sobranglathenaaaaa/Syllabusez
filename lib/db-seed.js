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
      [adminId, "Dr. Danilo T. dela Cruz", "admin@pup.edu.ph", "admin"]
    );
    await query(
      "INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [instructorId, "Prof. Maria Elizabeth C. Santos", "instructor@pup.edu.ph", "instructor"]
    );
    await query(
      "INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)",
      [studentId, "Juan G. Gomez", "student@pup.edu.ph", "student"]
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

    // 6. Seed CCIS101 Syllabus - APPROVED
    await query(
      `INSERT INTO syllabi (
        id, course_id, instructor_id, status, version, approval_comment,
        course_description, prerequisites, corequisites, semester, academic_year,
        vision, mission, quality_policy, institutional_outcomes,
        program_outcomes, course_outcomes, performance_indicators
      ) VALUES (?, ?, ?, 'approved', 1, 'Looks excellent. Met all PUP syllabus standards.', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        syllabusCCIS101,
        comp001Id,
        instructorId,
        "This course introduces the students to the fundamentals of logic formulation and allows the student to learn and apply the art and style of procedural programming to solve computational problems adhering to the standards and guidelines of documentation. It includes discussion on I/O statements, loop and branching instructions, and creating functions and procedures.",
        "None",
        "None",
        "1st Semester",
        "2025-2026",
        "PUP: The National Polytechnic University (PUP: Pambansang Politeknikong Unibersidad)",
        "Ensuring inclusive and equitable quality education and promoting lifelong learning opportunities through a re-engineered polytechnic university by committing to:\n- provide democratized access to educational opportunities\n- offer industry-oriented curricula\n- embed a culture of research and innovation\n- continuously develop faculty and employees with the highest level of professionalism\n- engage public and private institutions and other stakeholders for the attainment of social development goals",
        "The Polytechnic University of the Philippines commits to provide inclusive and equitable quality education and promote lifelong learning opportunities for human advancement and social transformation through re-engineered polytechnic academic programs. Toward this end, we, the members of the PUP Community will vigorously and steadfastly endeavor to continuously improve the standard of university services to the satisfaction of our clients through the adoption and continuous review of our Quality Management System.",
        JSON.stringify([]),
        JSON.stringify([
          { id: "PLO-1", description: "Apply software engineering principles to design, develop and test high-quality software solutions." }
        ]),
        JSON.stringify([
          { id: "CLO-1", description: "Formulate correct algorithms using sequential, selection, and iterative control structures.", alignments: [] },
          { id: "CLO-2", description: "Write structured programs using arrays, user-defined functions, and parameter passing.", alignments: ["PLO-1"] }
        ]),
        JSON.stringify([
          { id: "PI-1", description: "Construct correct flowcharts and pseudocode to solve mathematical and business problems.", alignments: ["CLO-1"] },
          { id: "PI-2", description: "Implement bug-free software modules that cleanly reuse defined functions.", alignments: ["CLO-2"] }
        ])
      ]
    );

    // Learning Outcomes for CCIS101 (legacy, keeping for safety)
    const outcomes101 = [
      "Understand the fundamental concepts of computer hardware, software, and networking.",
      "Describe the history, evolution, and future trends of computing systems.",
      "Demonstrate basic programming thinking and analytical problem-solving skills.",
      "Apply computing ethics and discuss professional responsibilities in the digital age."
    ];
    for (let i = 0; i < outcomes101.length; i++) {
      await query(
        "INSERT INTO learning_outcomes (id, syllabus_id, description, order_index) VALUES (uuid(), ?, ?, ?)",
        [syllabusCCIS101, outcomes101[i], i + 1]
      );
    }

    // Weekly Plans for CCIS101
    const plans101 = [
      { week: 1, topic: "Computer Hardware Components and Processing", acts: "Virtual assembly lab, group hardware comparison", ass: "Hardware component labeling quiz", mats: "Lab worksheet, Slide deck 2", dlo: "Explain hardware operation and logic processing", clo: '["CLO-1"]' },
      { week: 2, topic: "Operating Systems and System Software Utilities", acts: "Disk partition demo, command-line basics", ass: "Practical shell commands quiz", mats: "Operating systems manual, Slide deck 3", dlo: "Manipulate system configurations and command prompt tools", clo: '["CLO-2"]' },
      { week: 3, topic: "Networking Fundamentals, Internet, and Cloud Architecture", acts: "Ping/traceroute analysis, network diagramming", ass: "Network topology mapping assignment", mats: "Networking essentials guide", dlo: "Diagnose basic network connectivity issues", clo: '["CLO-2"]' }
    ];
    for (let i = 0; i < plans101.length; i++) {
      await query(
        "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index, desired_learning_outcomes, clo_alignment) VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [syllabusCCIS101, plans101[i].week, plans101[i].topic, plans101[i].acts, plans101[i].ass, plans101[i].mats, i + 1, plans101[i].dlo, plans101[i].clo]
      );
    }

    // Grading components for CCIS101 (Must total 100%)
    const grading101 = [
      { name: "Midterm & Final Examinations", pct: 40 },
      { name: "Quizzes & Laboratory Activities", pct: 30 },
      { name: "Assignments & Homework Projects", pct: 20 },
      { name: "Class Attendance & Professional Attitude", pct: 10 }
    ];
    for (let i = 0; i < grading101.length; i++) {
      await query(
        "INSERT INTO grading_components (id, syllabus_id, name, percentage, order_index) VALUES (uuid(), ?, ?, ?, ?)",
        [syllabusCCIS101, grading101[i].name, grading101[i].pct, i + 1]
      );
    }

    // 7. Seed CCIS102 Syllabus - SUBMITTED (Pending Admin Approval)
    await query(
      `INSERT INTO syllabi (
        id, course_id, instructor_id, status, version,
        course_description, prerequisites, corequisites, semester, academic_year,
        vision, mission, quality_policy, institutional_outcomes,
        program_outcomes, course_outcomes, performance_indicators
      ) VALUES (?, ?, ?, 'submitted', 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        syllabusCCIS102,
        comp002Id,
        instructorId,
        "Deep dive into programming, solving intermediate logic challenges.",
        "COMP 001",
        "None",
        "2nd Semester",
        "2025-2026",
        "PUP Vision Text...",
        "PUP Mission Text...",
        "PUP Quality Policy Text...",
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      ]
    );

    const outcomes102 = [
      "Write, debug, and trace simple programs in C language.",
      "Employ correct control structures (if-else, switch, for, while) to solve coding problems.",
      "Define and implement user-defined functions and arrays."
    ];
    for (let i = 0; i < outcomes102.length; i++) {
      await query(
        "INSERT INTO learning_outcomes (id, syllabus_id, description, order_index) VALUES (uuid(), ?, ?, ?)",
        [syllabusCCIS102, outcomes102[i], i + 1]
      );
    }

    const plans102 = [
      { week: 1, topic: "Introduction to Algorithm Design & Pseudo-coding", acts: "Flowchart sketching, logic puzzles", ass: "Pseudo-code portfolio", mats: "Logic textbook", dlo: "Understand flowcharts", clo: '[]' },
      { week: 2, topic: "C Language Basics: Syntax, Data Types, and Operators", acts: "First 'Hello World' coding lab", ass: "Arithmetic calculator lab exam", mats: "C programming guidelines", dlo: "Write syntax", clo: '[]' }
    ];
    for (let i = 0; i < plans102.length; i++) {
      await query(
        "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index, desired_learning_outcomes, clo_alignment) VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [syllabusCCIS102, plans102[i].week, plans102[i].topic, plans102[i].acts, plans102[i].ass, plans102[i].mats, i + 1, plans102[i].dlo, plans102[i].clo]
      );
    }

    const grading102 = [
      { name: "Programming Lab Exams", pct: 50 },
      { name: "Written Quizzes & Theory", pct: 30 },
      { name: "Final Coding Capstone Project", pct: 20 }
    ];
    for (let i = 0; i < grading102.length; i++) {
      await query(
        "INSERT INTO grading_components (id, syllabus_id, name, percentage, order_index) VALUES (uuid(), ?, ?, ?, ?)",
        [syllabusCCIS102, grading102[i].name, grading102[i].pct, i + 1]
      );
    }

    // 8. Seed CCIS103 Syllabus - DRAFT
    await query(
      `INSERT INTO syllabi (
        id, course_id, instructor_id, status, version,
        course_description, prerequisites, corequisites, semester, academic_year,
        vision, mission, quality_policy, institutional_outcomes,
        program_outcomes, course_outcomes, performance_indicators
      ) VALUES (?, ?, ?, 'draft', 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        syllabusCCIS103,
        comp006Id,
        instructorId,
        "Understand linked lists, trees, graphs, and search strategies.",
        "COMP 002",
        "None",
        "1st Semester",
        "2026-2027",
        "PUP Vision...",
        "PUP Mission...",
        "PUP Quality...",
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([])
      ]
    );

    await query(
      "INSERT INTO learning_outcomes (id, syllabus_id, description, order_index) VALUES (uuid(), ?, 'Formulate efficient solutions utilizing stacks, queues, and linked lists.', 1)",
      [syllabusCCIS103]
    );

    await query(
      "INSERT INTO weekly_plans (id, syllabus_id, week, topic, activities, assessments, materials, order_index, desired_learning_outcomes, clo_alignment) VALUES (uuid(), ?, 1, 'Review of OOP Concepts and Pointers', 'Array debugging tasks', 'Pointer assessment', 'Reference sheets', 1, 'DLO text', '[]')",
      [syllabusCCIS103]
    );

    await query(
      "INSERT INTO grading_components (id, syllabus_id, name, percentage, order_index) VALUES (uuid(), ?, 'Exams', 50, 1), (uuid(), ?, 'Labs', 50, 2)",
      [syllabusCCIS103, syllabusCCIS103]
    );

    // Re-enable foreign key checks
    await query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Database seeded successfully.");
    return { seeded: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Failed to seed database:", error);
    await query("SET FOREIGN_KEY_CHECKS = 1");
    throw error;
  }
}

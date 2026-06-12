export const runtime = "nodejs";

import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

// Initialize database table on first request if it doesn't exist
async function ensureTableExists() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS curricula (
        program_id VARCHAR(255) PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
      )
    `);
  } catch (err) {
    console.error("Error creating curricula table:", err);
  }
}

// Mock AI Curriculum Extraction Function
async function extractCoursesFromText(text, programId) {
  console.log("Mock AI parsing curriculum text length:", text.length);
  // Realistically, we'd use an LLM API here. 
  // We'll mock a generic structured grid based on a typical layout.
  // This produces courses structured by year_level and semester.
  const parsedCourses = [
    { year_level: "FIRST YEAR", semester: "1st Semester", code: "GEED 032", title: "Filipinolohiya at Pambansang Kaunlaran", units: 3, prereq: "None", coreq: "None" },
    { year_level: "FIRST YEAR", semester: "1st Semester", code: "COMP 001", title: "Introduction to Computing", units: 3, prereq: "None", coreq: "None" },
    { year_level: "FIRST YEAR", semester: "1st Semester", code: "COMP 002", title: "Computer Programming 1", units: 3, prereq: "None", coreq: "None" },
    { year_level: "FIRST YEAR", semester: "2nd Semester", code: "COMP 003", title: "Computer Programming 2", units: 3, prereq: "COMP 002", coreq: "None" },
    { year_level: "FIRST YEAR", semester: "2nd Semester", code: "COMP 004", title: "Discrete Structures 1", units: 3, prereq: "None", coreq: "None" },
    
    { year_level: "SECOND YEAR", semester: "1st Semester", code: "COMP 007", title: "Operating Systems", units: 3, prereq: "COMP 001", coreq: "None" },
    { year_level: "SECOND YEAR", semester: "1st Semester", code: "INTE 201", title: "Programming 3 (Structured)", units: 3, prereq: "COMP 003", coreq: "None" },
    { year_level: "SECOND YEAR", semester: "2nd Semester", code: "COMP 009", title: "Object Oriented Programming", units: 3, prereq: "COMP 006", coreq: "None" },
    { year_level: "SECOND YEAR", semester: "2nd Semester", code: "COMP 010", title: "Information Management", units: 3, prereq: "None", coreq: "None" },
    
    { year_level: "THIRD YEAR", semester: "1st Semester", code: "COMP 016", title: "Web Development", units: 3, prereq: "COMP 010", coreq: "None" },
    { year_level: "THIRD YEAR", semester: "1st Semester", code: "INTE 301", title: "Systems Integration and Architecture 1", units: 3, prereq: "INTE 202", coreq: "None" },
    { year_level: "THIRD YEAR", semester: "2nd Semester", code: "INTE 303", title: "Capstone Project 1", units: 3, prereq: "COMP 015", coreq: "None" },
    { year_level: "THIRD YEAR", semester: "2nd Semester", code: "COMP 019", title: "Applications Development", units: 3, prereq: "COMP 010", coreq: "None" },
    
    { year_level: "FOURTH YEAR", semester: "1st Semester", code: "INTE 402", title: "Capstone Project 2", units: 3, prereq: "INTE 303", coreq: "None" },
    { year_level: "FOURTH YEAR", semester: "1st Semester", code: "INTE 403", title: "Systems Administration and Maintenance", units: 3, prereq: "COMP 012", coreq: "None" },
    { year_level: "FOURTH YEAR", semester: "2nd Semester", code: "INTE 404", title: "Practicum (500 HOURS)", units: 12, prereq: "All previous course completions", coreq: "None" }
  ];

  // Remove existing courses for this program to replace with fresh AI parsed ones
  await query("DELETE FROM courses WHERE program_id = ?", [programId]);

  // Insert extracted courses
  for (const c of parsedCourses) {
    try {
      await query(
        `INSERT INTO courses (id, code, title, units, program_id, prereq, coreq, year_level, semester)
         VALUES (uuid(), ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.code, c.title, c.units, programId, c.prereq, c.coreq, c.year_level, c.semester]
      );
    } catch (insertErr) {
      console.error("Failed to insert parsed course", c.code, insertErr.message);
    }
  }
}

export async function GET() {
  await ensureTableExists();
  try {
    const rows = await query("SELECT * FROM curricula");
    return NextResponse.json({ curricula: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await ensureTableExists();
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const programId = formData.get("programId") || formData.get("departmentId");

    if (!file || !programId) {
      return NextResponse.json({ error: "Missing required file or program parameter." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "curricula");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFileName = `${programId}_${safeFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    
    fs.writeFileSync(filePath, buffer);

    await query(
      `INSERT INTO curricula (program_id, file_name, file_type) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE file_name = ?, file_type = ?, uploaded_at = CURRENT_TIMESTAMP`,
      [programId, safeFileName, file.type, safeFileName, file.type]
    );

    // Mock AI text extraction from file
    let extractedText = "";
    if (safeFileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (safeFileName.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else {
      // PDF or other unsupported types - mock text anyway for simulation
      extractedText = "Simulated curriculum content...";
    }

    // Trigger AI parsing
    await extractCoursesFromText(extractedText, programId);

    return NextResponse.json({ 
      success: true, 
      fileName: safeFileName,
      url: `/uploads/curricula/${uniqueFileName}`
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId") || searchParams.get("departmentId");

    if (!programId) {
      return NextResponse.json({ error: "Missing program ID parameter." }, { status: 400 });
    }

    const rows = await query("SELECT file_name FROM curricula WHERE program_id = ?", [programId]);
    if (rows.length > 0) {
      const fileName = rows[0].file_name;
      const uniqueFileName = `${programId}_${fileName}`;
      const filePath = path.join(process.cwd(), "public", "uploads", "curricula", uniqueFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await query("DELETE FROM curricula WHERE program_id = ?", [programId]);
    
    // Cleanup courses when curriculum is deleted
    await query("DELETE FROM courses WHERE program_id = ?", [programId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

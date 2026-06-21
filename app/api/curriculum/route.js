export const runtime = "nodejs";

import { supabase } from "@/lib/db";
import {
  parseCoursesFromDocumentText,
  normalizeParsedCourse,
} from "@/lib/curriculum-parser";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

async function extractTextFromUpload(buffer, safeFileName, filePath) {
  const lowerName = safeFileName.toLowerCase();
  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
    const result = await mammoth.convertToHtml({ path: filePath });
    return result.value || "";
  }

  if (lowerName.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  if (lowerName.endsWith(".pdf")) {
    const pdfParseModule = await import("pdf-parse-new");
    const parse = pdfParseModule.default || pdfParseModule;
    const pdf = await parse(buffer);
    return pdf.text || "";
  }

  return buffer.toString("utf-8");
}

async function extractCoursesFromText(text, programId) {
  // Debug: log first 500 chars of extracted text to help diagnose parsing issues
  console.log("[curriculum] Extracted text preview:", text?.slice(0, 500));

  const parsedCourses = parseCoursesFromDocumentText(text);
  console.log("[curriculum] Parsed courses count:", parsedCourses.length);

  if (!parsedCourses.length) {
    console.warn("No curriculum courses could be parsed from the uploaded document.");
    return 0;
  }

  await supabase.from("courses").delete().eq("program_id", programId);

  let insertedCount = 0;


  const uniqueCoursesMap = new Map();
  parsedCourses.forEach((course) => {
    const normalized = normalizeParsedCourse(course);
    if (normalized && normalized.code && !uniqueCoursesMap.has(normalized.code)) {
      uniqueCoursesMap.set(normalized.code, normalized);
    }
  });

  const coursesToInsert = Array.from(uniqueCoursesMap.values()).map((normalized) => {
    return {
      id: crypto.randomUUID(),
      code: normalized.code,
      title: normalized.title,
      lecture_hours: normalized.lectureHours,
      lab_hours: normalized.labHours,
      units: normalized.units,
      program_id: programId,
      prereq: normalized.prereq,
      coreq: normalized.coreq,
      year_level: normalized.year_level,
      semester: normalized.semester
    };
  });

  const chunkSize = 100;
  for (let i = 0; i < coursesToInsert.length; i += chunkSize) {
    const chunk = coursesToInsert.slice(i, i + chunkSize);
    const { error: insertErr } = await supabase.from("courses").insert(chunk);
    if (insertErr) {
      console.error("Failed to insert batch of courses:", insertErr.message);
    } else {
      insertedCount += chunk.length;
    }
  }

  return insertedCount;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

    if (userId) {
      const { data: user, error: userErr } = await supabase
        .from("users")
        .select("role, program_id")
        .eq("id", userId)
        .single();

      if (!userErr && user && user.role === "student") {
        const { data: rows, error } = await supabase
          .from("curricula")
          .select("*")
          .eq("program_id", user.program_id);
        if (error) throw error;
        return NextResponse.json({ curricula: rows });
      }
    }

    const { data: rows, error } = await supabase.from("curricula").select("*");
    if (error) throw error;
    return NextResponse.json({ curricula: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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

    const { error: upsertError } = await supabase.from("curricula").upsert(
      {
        program_id: programId,
        file_name: safeFileName,
        file_type: file.type,
        uploaded_at: new Date().toISOString()
      },
      { onConflict: "program_id" }
    );

    if (upsertError) throw upsertError;

    const extractedText = await extractTextFromUpload(buffer, safeFileName, filePath);
    const parsedCount = await extractCoursesFromText(extractedText, programId);

    return NextResponse.json({
      success: true,
      fileName: safeFileName,
      parsedCount,
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

    const { data: rows } = await supabase.from("curricula").select("file_name").eq("program_id", programId);
    if (rows && rows.length > 0) {
      const fileName = rows[0].file_name;
      const uniqueFileName = `${programId}_${fileName}`;
      const filePath = path.join(process.cwd(), "public", "uploads", "curricula", uniqueFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await supabase.from("curricula").delete().eq("program_id", programId);
    await supabase.from("courses").delete().eq("program_id", programId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export { extractCoursesFromText };

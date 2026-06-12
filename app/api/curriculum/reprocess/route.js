import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { extractCoursesFromText } from "./../route";

export async function POST(request) {
  try {
    const body = await request.json();
    const programId = body.programId;
    if (!programId) return NextResponse.json({ error: "Missing programId" }, { status: 400 });

    const { data: rows, error } = await supabase
      .from("curricula")
      .select("file_name")
      .eq("program_id", programId)
      .single();

    if (error || !rows) {
      return NextResponse.json({ error: "Curriculum not found for program" }, { status: 404 });
    }

    const fileName = rows.file_name;
    const uniqueFileName = `${programId}_${fileName}`;
    const filePath = path.join(process.cwd(), "public", "uploads", "curricula", uniqueFileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Uploaded file not found on disk" }, { status: 404 });
    }

    const buffer = fs.readFileSync(filePath);
    let extractedText = "";

    if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.default.extractRawText({ path: filePath });
      extractedText = result.value || "";
    } else if (fileName.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      const pdfParseModule = await import("pdf-parse-new");
      const parse = pdfParseModule.default || pdfParseModule;
      const pdf = await parse(buffer);
      extractedText = pdf.text || "";
    } else {
      extractedText = buffer.toString("utf-8");
    }

    const parsedCount = await extractCoursesFromText(extractedText, programId);
    return NextResponse.json({ success: true, parsedCount });
  } catch (err) {
    console.error("Reprocess error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const runtime = "nodejs";

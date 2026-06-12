export const runtime = "nodejs";

import { supabase } from "@/lib/db";
import crypto from "crypto";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";



// Ensure table exists is not needed with Supabase migrations
async function ensureTableExists() {
  // Supabase migrations handle schema creation
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/<br\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractJsonArrayFromText(text) {
  const raw = String(text || "").trim();

  // Try direct parse first
  try {
    const direct = JSON.parse(raw);
    if (Array.isArray(direct)) return direct;
    if (direct && Array.isArray(direct.courses)) return direct.courses;
  } catch (e) {}

  // Find the first '[' and attempt to parse a JSON array using multiple strategies.
  const startIdx = raw.indexOf("[");
  if (startIdx === -1) return null;

  // Strategy 1: try to find the last ']' and parse the slice directly
  const lastBracketIdx = raw.lastIndexOf("]");
  if (lastBracketIdx > startIdx) {
    const slice = raw.slice(startIdx, lastBracketIdx + 1);
    try {
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.courses)) return parsed.courses;
    } catch (e) {
      // fall through to more robust attempts
    }
  }

  // Strategy 2: attempt to repair common truncation by balancing brackets
  // Walk forward and maintain bracket depth; if we reach EOF with depth>0, append closing brackets.
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIdx; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    } else {
      if (ch === '"') { inString = true; continue; }
      if (ch === "[") depth++;
      if (ch === "]") depth--;
    }
  }

  // If we ended with depth > 0, try appending that many ']' and parse
  if (depth > 0) {
    const candidate = raw.slice(startIdx) + "]".repeat(depth);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.courses)) return parsed.courses;
    } catch (e) {
      // continue
    }
  }

  // Strategy 3: progressively trim trailing characters from the first '[' forward
  // and try to parse a shorter substring. This can succeed if the AI appended extra text
  // after a valid JSON block that breaks parsing.
  const maxTrim = Math.min(2000, raw.length - startIdx);
  for (let trim = 0; trim < maxTrim; trim += 50) {
    const end = raw.length - trim;
    if (end <= startIdx) break;
    const candidate = raw.slice(startIdx, end);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.courses)) return parsed.courses;
    } catch (e) {
      // ignore and continue
    }
  }

  // Strategy 4: fallback regex non-greedy block search (best-effort)
  const bracketMatch = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/m);
  if (bracketMatch) {
    try {
      const parsed = JSON.parse(bracketMatch[0]);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.courses)) return parsed.courses;
    } catch (e) {}
  }

  return null;
}

function normalizeCourseObject(raw) {
  return {
    year_level: String(raw.year_level || raw.year || "").trim() || "UNASSIGNED",
    semester: String(raw.semester || raw.term || "").trim() || "Unassigned Semester",
    code: String(raw.code || raw.course_code || "").trim(),
    title: String(raw.title || raw.course_title || "").trim(),
    units: raw.units === null || raw.units === undefined ? null : Number(raw.units) || null,
    prereq: String(raw.prereq || raw.prerequisites || "").trim(),
    coreq: String(raw.coreq || raw.corequisites || "").trim()
  };
}

async function callGenerativeExtraction(text) {
  const prompt = `Extract all curriculum course entries from the text below.

Return only a JSON array of objects, with no markdown or explanation.
Each object must contain exactly these keys: year_level, semester, code, title, units, prereq, coreq.
Use empty string for missing text values and null for missing numeric units.

Text:\n${text}`;

  if (process.env.GEMINI_API_KEY) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 2048
        }
      })
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error?.message || "Gemini API failed");
    }

    const candidate = body?.candidates?.[0];
    const output = candidate?.content?.parts?.[0]?.text || "";
    return String(output);
  }

  if (process.env.OPENAI_API_KEY) {
    const url = "https://api.openai.com/v1/responses";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
        temperature: 0,
        max_output_tokens: 1200
      })
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error?.message || "OpenAI API failed");
    }

    if (typeof body.output_text === "string") {
      return body.output_text;
    }

    const contents = body.output?.map(item => {
      if (typeof item === "string") return item;
      if (item?.content) {
        return item.content.map(c => c?.text || "").join("");
      }
      return item?.text || "";
    }).join("");

    return contents;
  }

  return "";
}

function parseCoursesWithHeuristics(text) {
  const raw = normalizeText(text);
  const lines = raw.split(/\n/).map((l) => l.replace(/\s{2,}/g, " ").trim()).filter(Boolean);

  const yearPatterns = [
    [/first year/i, 'FIRST YEAR'], [/1st year/i, 'FIRST YEAR'], [/year 1/i, 'FIRST YEAR'],
    [/second year/i, 'SECOND YEAR'], [/2nd year/i, 'SECOND YEAR'], [/year 2/i, 'SECOND YEAR'],
    [/third year/i, 'THIRD YEAR'], [/3rd year/i, 'THIRD YEAR'], [/year 3/i, 'THIRD YEAR'],
    [/fourth year/i, 'FOURTH YEAR'], [/4th year/i, 'FOURTH YEAR'], [/year 4/i, 'FOURTH YEAR']
  ];

  const semPatterns = [
    [/1st semester/i, '1st Semester'], [/first semester/i, '1st Semester'], [/semester 1/i, '1st Semester'],
    [/2nd semester/i, '2nd Semester'], [/second semester/i, '2nd Semester'], [/semester 2/i, '2nd Semester'],
    [/summer/i, 'Summer Term'], [/summer term/i, 'Summer Term']
  ];

  let currentYear = 'UNASSIGNED';
  let currentSemester = 'Unassigned Semester';
  const parsedCourses = [];

  const parseLine = (ln) => {
    let code = '';
    let title = ln;
    let units = null;

    const mCode = ln.match(/^([A-Z]{2,}\s*\d{1,4}[A-Z]?)[\-:\s]+(.+)$/i);
    if (mCode) {
      code = mCode[1].replace(/\s+/g, ' ').trim();
      title = mCode[2].trim();
    }

    const mUnits = title.match(/(\(|-)?\s*(\d{1,2}(?:\.\d+)?)\s*(units?)?\)?\s*$/i);
    if (mUnits) {
      units = Number(mUnits[2]);
      title = title.replace(mUnits[0], '').trim();
    }

    if (!code) {
      const mInner = ln.match(/([A-Z]{2,}\s*\d{1,4}[A-Z]?)/i);
      if (mInner) code = mInner[1].replace(/\s+/g, ' ').trim();
    }

    return { code, title, units };
  };

  for (const ln of lines) {
    const low = ln.toLowerCase();
    let matchedHeading = false;
    for (const [rx, name] of yearPatterns) {
      if (rx.test(low)) { currentYear = name; matchedHeading = true; }
    }
    for (const [rx, name] of semPatterns) {
      if (rx.test(low)) { currentSemester = name; matchedHeading = true; }
    }
    if (matchedHeading) continue;

    const { code, title, units } = parseLine(ln);
    if (!code && (!title || title.length < 6)) continue;

    parsedCourses.push({
      year_level: currentYear,
      semester: currentSemester,
      code: code || '',
      title: title || '',
      units: units || null,
      prereq: '',
      coreq: ''
    });
  }

  return parsedCourses;
}

async function extractCoursesFromText(text, programId) {
  const normalized = normalizeText(text);
  let parsedCourses = [];

  if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
    try {
      // Try AI extraction, with a couple retries if the output looks malformed/truncated.
      let aiResponse = null;
      let extracted = null;
      const maxAttempts = 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          aiResponse = await callGenerativeExtraction(normalized);
        } catch (callErr) {
          require("fs").appendFileSync("ai-debug.log", new Date().toISOString() + ` - AI call failed on attempt ${attempt}: ${callErr.message}\n`);
          if (attempt === maxAttempts) throw callErr;
          continue;
        }

        // Write the raw AI response with attempt marker
        require("fs").appendFileSync("ai-debug.log", `${new Date().toISOString()} - AI Response (attempt ${attempt}):\n` + aiResponse + "\n\n");

        extracted = extractJsonArrayFromText(aiResponse);
        if (Array.isArray(extracted) && extracted.length > 0) {
          parsedCourses = extracted.map(normalizeCourseObject);
          break;
        }

        // If extraction failed, log and retry — the AI sometimes returns truncated output.
        require("fs").appendFileSync("ai-debug.log", new Date().toISOString() + ` - Failed to extract JSON array on attempt ${attempt}. Extracted: ` + JSON.stringify(extracted) + "\n\n");

        // Small backoff before retrying
        await new Promise((res) => setTimeout(res, 500 * attempt));
      }
    } catch (aiError) {
      console.error("AI extraction failed:", aiError.message);
      require("fs").appendFileSync("ai-debug.log", new Date().toISOString() + " - AI Error:\n" + aiError.message + "\n\n");
    }
  } else {
    console.warn("No Gemini/OpenAI API key configured; falling back to local heuristics.");
  }

  if (!parsedCourses.length) {
    parsedCourses = parseCoursesWithHeuristics(normalized);
  }

  if (!parsedCourses.length) {
    console.warn("No curriculum courses could be parsed from the uploaded document.");
    return 0;
  }

  await supabase.from("courses").delete().eq("program_id", programId);

  let insertedCount = 0;

  const validCourses = parsedCourses.filter(c => c.title && c.code);

  if (validCourses.length > 0) {
    const coursesToInsert = validCourses.map(c => ({
      id: crypto.randomUUID(),
      code: c.code,
      title: c.title,
      units: c.units,
      program_id: programId,
      prereq: c.prereq || "",
      coreq: c.coreq || "",
      year_level: c.year_level || "UNASSIGNED",
      semester: c.semester || "Unassigned Semester"
    }));

    const chunkSize = 100;
    for (let i = 0; i < coursesToInsert.length; i += chunkSize) {
      const chunk = coursesToInsert.slice(i, i + chunkSize);
      try {
        const { error: insertErr } = await supabase.from("courses").insert(chunk);
        if (insertErr) {
          console.error("Failed to insert batch of courses:", insertErr.message);
        } else {
          insertedCount += chunk.length;
        }
      } catch (insertErr) {
        console.error("Batch insert error:", insertErr.message);
      }
    }
  }

  return insertedCount;
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("session_user")?.value || cookieStore.get("session_user_id")?.value;

    if (userId) {
      const { data: user, error: userErr } = await supabase.from("users").select("role, program_id").eq("id", userId).single();
      if (!userErr && user && user.role === "student") {
        const { data: rows, error } = await supabase.from("curricula").select("*").eq("program_id", user.program_id);
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

    const { error: upsertError } = await supabase.from("curricula").upsert({
      program_id: programId,
      file_name: safeFileName,
      file_type: file.type,
      uploaded_at: new Date().toISOString()
    }, { onConflict: "program_id" });

    if (upsertError) throw upsertError;

    let extractedText = "";
    if (safeFileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (safeFileName.endsWith(".txt")) {
      extractedText = buffer.toString("utf-8");
    } else if (safeFileName.endsWith(".pdf")) {
      const pdfParseModule = await import("pdf-parse-new");
      const parse = pdfParseModule.default || pdfParseModule;
      const pdf = await parse(buffer);
      extractedText = pdf.text || "";
    } else {
      extractedText = buffer.toString("utf-8");
    }

    // Read the uploaded document, then send its extracted text to Gemini/OpenAI.
    // The AI response is normalized into structured course rows and stored by program.
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
    
    // Cleanup courses when curriculum is deleted
    await supabase.from("courses").delete().eq("program_id", programId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export { extractCoursesFromText };

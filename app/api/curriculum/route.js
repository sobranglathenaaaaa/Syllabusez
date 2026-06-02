import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
    const programId = formData.get("programId") || formData.get("departmentId"); // handle fallback for legacy UI requests

    if (!file || !programId) {
      return NextResponse.json({ error: "Missing required file or program parameter." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "curricula");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Normalize filename and save to public assets directory
    // Using a sanitized pattern: [programId]_[filename] to ensure uniqueness per program
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFileName = `${programId}_${safeFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    
    fs.writeFileSync(filePath, buffer);

    // Save metadata in SQL curricula table
    await query(
      `INSERT INTO curricula (program_id, file_name, file_type) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE file_name = ?, file_type = ?, uploaded_at = CURRENT_TIMESTAMP`,
      [programId, safeFileName, file.type, safeFileName, file.type]
    );

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

    // Retrieve file name to clean up public disk file
    const rows = await query("SELECT file_name FROM curricula WHERE program_id = ?", [programId]);
    if (rows.length > 0) {
      const fileName = rows[0].file_name;
      const uniqueFileName = `${programId}_${fileName}`;
      const filePath = path.join(process.cwd(), "public", "uploads", "curricula", uniqueFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete database metadata
    await query("DELETE FROM curricula WHERE program_id = ?", [programId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

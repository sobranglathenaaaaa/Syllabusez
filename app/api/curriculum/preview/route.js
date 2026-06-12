import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName parameter" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", "curricula", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const result = await mammoth.convertToHtml({ path: filePath });
    
    return new NextResponse(result.value, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
}

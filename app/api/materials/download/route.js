import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { NextResponse } from "next/server";
import { verifyMaterialSignedUrl } from "@/lib/utils/signed-url";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  const payload = verifyMaterialSignedUrl(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired signed URL." }, { status: 401 });
  }

  const fileBuffer = await readFile(payload.filePath);
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${basename(payload.fileName)}"`,
    },
  });
}

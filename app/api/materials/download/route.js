import { readFile } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { verifyMaterialSignedUrl } from "@/lib/utils/signed-url";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";

  const payload = verifyMaterialSignedUrl(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired signed URL." }, { status: 401 });
  }

  const uploadRoot = resolve("/tmp/syllabus-materials");
  const resolvedPath = resolve(payload.filePath);

  if (resolvedPath !== uploadRoot && !resolvedPath.startsWith(uploadRoot + sep)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(resolvedPath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${basename(payload.fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Material not found." }, { status: 404 });
  }
}

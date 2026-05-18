import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createMaterialSignedUrl } from "@/lib/utils/signed-url";
import { createMaterial } from "@/services/syllabus.service";

export async function POST(request) {
  const formData = await request.formData();
  const syllabusId = String(formData.get("syllabusId") || "");
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const uploadDir = "/tmp/syllabus-materials";
  await mkdir(uploadDir, { recursive: true });

  const id = randomUUID();
  const fileName = `${id}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  await createMaterial({ syllabusId, fileUrl: filePath, fileName: file.name, fileType: file.type });
  const signedUrl = createMaterialSignedUrl({ id, filePath, fileName: file.name });

  return NextResponse.json({ id, signedUrl });
}

import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

export async function saveSyllabusDraft(payload) {
  if (!payload?.id) {
    return { error: "Syllabus ID is required." };
  }

  await query(
    "insert into syllabi (id, status, version) values (?, 'draft', 1) on duplicate key update updated_at = utc_timestamp()",
    [payload.id],
  );

  const updatedRows = await query("select updated_at from syllabi where id = ? limit 1", [payload.id]);
  const updatedAt = updatedRows[0]?.updated_at
    ? new Date(updatedRows[0].updated_at).toISOString()
    : new Date().toISOString();

  return {
    data: {
      ...payload,
      updated_at: updatedAt,
    },
  };
}

export async function createMaterial({ syllabusId, fileUrl, fileName, fileType }) {
  if (!syllabusId) {
    return null;
  }

  const id = randomUUID();
  await query("insert into materials (id, syllabus_id, file_url, file_name, file_type) values (?, ?, ?, ?, ?)", [
    id,
    syllabusId,
    fileUrl,
    fileName,
    fileType || null,
  ]);

  return id;
}

import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/db";

const DEFAULT_SYLLABUS_STATUS = "draft";
const DEFAULT_SYLLABUS_VERSION = 1;

export async function saveSyllabusDraft(payload) {
  if (!payload?.id) {
    return { error: "Syllabus ID is required." };
  }

  const { data, error } = await supabase
    .from("syllabi")
    .upsert({
      id: payload.id,
      status: DEFAULT_SYLLABUS_STATUS,
      version: DEFAULT_SYLLABUS_VERSION,
      updated_at: new Date().toISOString()
    })
    .select("updated_at")
    .single();

  if (error) {
    console.error("Error saving syllabus draft:", error);
    return { error: "Database error." };
  }

  return {
    data: {
      ...payload,
      updated_at: data.updated_at,
    },
  };
}

export async function createMaterial({ syllabusId, fileUrl, fileName, fileType }) {
  if (!syllabusId) {
    return null;
  }

  const id = randomUUID();
  const { error } = await supabase
    .from("materials")
    .insert([{
      id,
      syllabus_id: syllabusId,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType || null,
    }]);

  if (error) {
    console.error("Error creating material:", error);
    return null;
  }

  return id;
}

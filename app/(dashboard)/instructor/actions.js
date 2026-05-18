"use server";

import { saveSyllabusDraft } from "@/services/syllabus.service";

export async function saveSyllabusAction(payload) {
  return saveSyllabusDraft(payload);
}

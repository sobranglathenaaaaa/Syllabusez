import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/db";

export async function findOrCreateUser({ email, fullName, role }) {
  const { data: existingRows, error: existingError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", email)
    .limit(1);

  const existing = existingRows?.[0];

  if (existing) {
    return existing;
  }

  const id = randomUUID();
  const { error } = await supabase
    .from("users")
    .insert([{ id, full_name: fullName, email, role }]);

  if (error) {
    console.error("Failed to insert user:", error);
    throw error;
  }

  return { id, email, role };
}

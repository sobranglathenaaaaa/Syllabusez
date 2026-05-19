import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";

export async function findOrCreateUser({ email, fullName, role }) {
  const existingRows = await query("select id, email, role from users where email = ? limit 1", [email]);
  const existing = existingRows[0];

  if (existing) {
    return existing;
  }

  const id = randomUUID();
  await query("insert into users (id, full_name, email, role) values (?, ?, ?, ?)", [id, fullName, email, role]);

  return { id, email, role };
}

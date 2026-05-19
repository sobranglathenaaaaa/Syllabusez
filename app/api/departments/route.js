import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const departments = await query("SELECT id, name FROM departments ORDER BY name ASC");
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

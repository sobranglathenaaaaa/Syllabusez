import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await query("SELECT id, code, title, units, program_id, prereq, coreq, year_level, semester FROM courses ORDER BY code ASC");
    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

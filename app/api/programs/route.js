import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const programs = await query("SELECT id, name FROM programs ORDER BY name ASC");
    return NextResponse.json({ programs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

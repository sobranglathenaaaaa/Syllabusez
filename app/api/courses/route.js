import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, code, title, units, program_id, prereq, coreq, year_level, semester")
      .order("code", { ascending: true });
      
    if (error) throw error;
    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

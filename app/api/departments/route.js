import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Assuming departments maps to programs as there is no departments table
    const { data: departments, error } = await supabase
      .from("programs")
      .select("id, name")
      .order("name", { ascending: true });
    
    if (error) throw error;
    return NextResponse.json({ departments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

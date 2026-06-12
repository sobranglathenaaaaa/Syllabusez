import { supabase } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const { data: programs, error } = await supabase
      .from("programs")
      .select("id, name")
      .order("name", { ascending: true });
      
    if (error) throw error;
    return NextResponse.json({ programs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add a new program (admin only)
export async function POST(request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Program name is required" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from("programs")
      .insert([{ id, name }]);
      
    if (error) throw error;
    return NextResponse.json({ message: "Program added", program: { id, name } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a program (admin only)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("programId");
    if (!id) {
      return NextResponse.json({ error: "programId query param required" }, { status: 400 });
    }
    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    return NextResponse.json({ message: "Program deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

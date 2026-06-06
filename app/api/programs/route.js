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

// Add a new program (admin only)
export async function POST(request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Program name is required" }, { status: 400 });
    }
    const id = crypto.randomUUID();
    await query("INSERT INTO programs (id, name) VALUES (?, ?)", [id, name]);
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
    await query("DELETE FROM programs WHERE id = ?", [id]);
    // Cascade deletes related curriculum entries via foreign key constraints
    return NextResponse.json({ message: "Program deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

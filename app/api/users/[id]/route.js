import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// DELETE /api/users/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query("DELETE FROM profiles WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

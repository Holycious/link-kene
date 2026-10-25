import { NextRequest, NextResponse } from "next/server";
import { incrementClick } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) {
      return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
    }
    const updated = incrementClick(id);
    return NextResponse.json({ ok: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
}

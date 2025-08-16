// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json(null);
  return NextResponse.json({ role: s.role });
}



// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

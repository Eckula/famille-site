// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getMe } from "@/lib/auth";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const me = await getMe();
  return NextResponse.json(me);
}

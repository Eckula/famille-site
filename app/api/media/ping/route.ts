// app/api/media/ping/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

function errMsg(e: any) {
  return e?.error?.message
      || e?.response?.error?.message
      || e?.message
      || (typeof e === "string" ? e : JSON.stringify(e));
}

export async function GET() {
  try {
    const ping = await (cloudinary as any).api.ping();
    const test = await (cloudinary as any).search
      .expression("folder:famille* OR public_id:famille/*")
      .max_results(1)
      .execute();

    return NextResponse.json({
      ok: true,
      ping,
      found: test?.total_count ?? test?.resources?.length ?? 0,
      sample: test?.resources?.[0]?.public_id ?? null,
    });
  } catch (e: any) {
    const msg = errMsg(e);
    console.error("[media/ping] ERROR →", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

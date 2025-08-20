export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const bad = (msg: string, status = 500) => ok({ error: msg }, status);

export async function GET() {
  try {
    const rows = await prisma.mediaIndex.groupBy({
      by: ["appFolderId"],              // 👈 on reste en appFolderId
      where: { appFolderId: { not: null } },
      _count: { _all: true },
    });

    const map: Record<string, number> = {};
    for (const r of rows) {
      if (r.appFolderId) map[r.appFolderId] = r._count._all;
    }

    return ok({
      counts: map,
      mediaCount: map,
      mediaCountByFolderId: map,
      byFolderId: map,
      ts: Date.now(),
    });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET /api/folders/map");
  }
}

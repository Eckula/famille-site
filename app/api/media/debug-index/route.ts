// app/api/media/debug-index/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const json = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pid = url.searchParams.get("public_id") || "";

    if (pid) {
      const row = await prisma.mediaIndex.findUnique({
        where: { publicId: pid },
        select: { publicId: true, appFolderId: true, createdAt: true },
      });
      return json({ public_id: pid, exists: !!row, row });
    }

    const [total, unassigned, assigned] = await Promise.all([
      prisma.mediaIndex.count(),
      prisma.mediaIndex.count({ where: { appFolderId: null } }),
      prisma.mediaIndex.count({ where: { NOT: { appFolderId: null } } }),
    ]);

    const recentAll = await prisma.mediaIndex.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { publicId: true, appFolderId: true, createdAt: true },
    });

    const recentUnassigned = await prisma.mediaIndex.findMany({
      where: { appFolderId: null },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { publicId: true, appFolderId: true, createdAt: true },
    });

    return json({
      counts: { total, unassigned, assigned },
      recentAll,
      recentUnassigned,
    });
  } catch (e: any) {
    return json({ error: e?.message || "debug-index failed" }, 500);
  }
}

// app/api/folders/assign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../_admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const prisma = new PrismaClient();
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  // 🔒 Admin requis
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { folderId, public_ids } = await req.json();
    const ids: string[] = Array.isArray(public_ids) ? public_ids.filter(Boolean) : [];
    if (!ids.length) return ok({ error: "Aucun public_id fourni." }, 400);

    const tx = ids.map((publicId) =>
      prisma.mediaIndex.upsert({
        where: { publicId },
        update: { folderId: folderId ?? null },
        create: { publicId, folderId: folderId ?? null },
      })
    );
    const res = await prisma.$transaction(tx);
    return ok({ ok: true, count: res.length });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur d'affectation." }, 400);
  }
}

// app/api/folders/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// Si tu veux restreindre aux admins, dé-commente et garde le check plus bas
// import { requireAdmin } from "../../_admin";

const prisma = new PrismaClient();
const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/folders/create
 * body: { name: string, parentId?: string | null }
 *
 * Upsert par contrainte composite @@unique([parentId, name])
 * -> évite les doublons si même nom sous le même parentId.
 */
export async function POST(req: Request) {
  // const deny = await requireAdmin(req); if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const parentId =
      body?.parentId === undefined || body?.parentId === null
        ? null
        : String(body.parentId);

    if (!name) return ok({ error: "Paramètre `name` requis." }, 400);

    const folder = await prisma.folder.upsert({
      where: { parentId_name: { parentId, name } },
      update: {},
      create: { name, parentId },
    });

    return ok({ ok: true, item: folder });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur création dossier (Prisma)." }, 500);
  }
}

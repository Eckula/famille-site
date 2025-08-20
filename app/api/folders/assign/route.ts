// app/api/folders/assign/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../_admin";

const prisma = new PrismaClient();
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const { folderId } = body;
    const list: string[] = (body.public_ids || body.publicIds || body.ids || []).filter(Boolean);

    if (!Array.isArray(list) || list.length === 0) {
      return ok({ error: "Aucun public_id fourni." }, 400);
    }

    if (folderId == null) {
      // Retirer l’affectation
      const res = await prisma.mediaIndex.deleteMany({ where: { publicId: { in: list } } });
      return ok({ ok: true, count: res.count, action: "unassign" });
    }

    // Vérifier que le folder existe
    const folder = await prisma.folder.findUnique({ where: { id: String(folderId) } });
    if (!folder) return ok({ error: `Folder introuvable: ${folderId}` }, 404);

    // Upsert par publicId (publicId est @unique dans ton schéma)
    const res = await prisma.$transaction(
      list.map((publicId) =>
        prisma.mediaIndex.upsert({
          where: { publicId },
          update: { folderId },
          create: { publicId, folderId },
        })
      )
    );

    return ok({ ok: true, count: res.length, folderId, action: "assign" });
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (/Unique constraint/i.test(msg)) {
      return ok({ error: "Contrainte unique manquante sur MediaIndex.publicId." }, 400);
    }
    if (/Foreign key/i.test(msg)) {
      return ok({ error: "folderId inconnu en base (FK)." }, 400);
    }
    return ok({ error: msg }, 400);
  }
}

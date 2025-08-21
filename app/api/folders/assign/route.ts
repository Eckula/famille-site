// app/api/folders/assign/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";            // ✅ singleton
import { requireAdmin } from "../../_admin";  // doit renvoyer NextResponse | null

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

type Body = {
  folderId?: string | null;
  public_ids?: string[];
  publicIds?: string[];
  ids?: string[];
};

export async function POST(req: Request) {
  // contrôle d’accès (création/affectation de liens = réservé admin)
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body: Body = (await req.json().catch(() => ({}))) as any;

    // liste des public_id acceptée sous plusieurs alias
    const list = (body.public_ids || body.publicIds || body.ids || []).filter(Boolean);
    if (!Array.isArray(list) || list.length === 0) {
      return ok({ error: "Aucun public_id fourni." }, 400);
    }

    // folderId peut arriver comme "", null, undefined
    const raw = body.folderId;
    const targetFolderId: string | null =
      raw === undefined || raw === null || String(raw).trim() === "" ? null : String(raw);

    if (targetFolderId === null) {
      // 🔹 Retirer l’affectation → conserver la ligne et mettre appFolderId = null
      const res = await prisma.$transaction(
        list.map((publicId) =>
          prisma.mediaIndex.upsert({
            where: { publicId },
            update: { appFolderId: null },
            create: { publicId, appFolderId: null },
          })
        )
      );
      return ok({ ok: true, count: res.length, action: "unassign" });
    }

    // 🔹 Vérifier que le dossier existe (modèle Prisma = AppFolder)
    const folder = await prisma.appFolder.findUnique({
      where: { id: targetFolderId },
      select: { id: true, name: true },
    });
    if (!folder) return ok({ error: `Folder introuvable: ${targetFolderId}` }, 404);

    // 🔹 Affecter → upsert par publicId en écrivant appFolderId
    const res = await prisma.$transaction(
      list.map((publicId) =>
        prisma.mediaIndex.upsert({
          where: { publicId },
          update: { appFolderId: targetFolderId },
          create: { publicId, appFolderId: targetFolderId },
        })
      )
    );

    return ok({
      ok: true,
      count: res.length,
      folderId: targetFolderId,
      folderName: folder.name,
      action: "assign",
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    // messages un peu plus clairs
    if (/Unique constraint/i.test(msg))
      return ok({ error: "Contrainte unique manquante sur MediaIndex.publicId." }, 400);
    if (/Foreign key/i.test(msg))
      return ok({ error: "folderId inconnu en base (FK)." }, 400);
    return ok({ error: msg }, 400);
  }
}


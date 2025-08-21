// app/api/media/assign/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "../../_admin";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/media/assign
 *
 * Body exemple:
 * {
 *   action: "assign" | "unassign",
 *   appFolderId?: "xxx",     // alias: folderId
 *   folderId?: "xxx",        // alias accepté
 *   publicIds: ["id1","id2"] // alias: public_ids | ids
 * }
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "assign");

    const ids: string[] = (body.publicIds || body.public_ids || body.ids || [])
      .filter(Boolean)
      .map((x: any) => String(x));

    if (!Array.isArray(ids) || ids.length === 0) {
      return ok({ error: "Aucun publicId fourni." }, 400);
    }

    // On unifie l’ID de dossier (alias appFolderId/folderId)
    const targetFolderId: string | null =
      action === "assign"
        ? String(body?.appFolderId ?? body?.folderId ?? "")
        : null;

    if (action === "assign" && !targetFolderId) {
      return ok({ error: "folderId (ou appFolderId) requis pour 'assign'." }, 400);
    }

    // Vérifier l’existence du dossier si assign
    if (targetFolderId) {
      const exists = await prisma.appFolder.findUnique({
        where: { id: targetFolderId },
        select: { id: true },
      });
      if (!exists) return ok({ error: "Dossier introuvable." }, 404);
    }

    let results: { upserted?: number; deleted?: number } = {};

    if (action === "assign" && targetFolderId) {
      // Upsert par publicId (unique)
      const res = await prisma.$transaction(
        ids.map((publicId) =>
          prisma.mediaIndex.upsert({
            where: { publicId },
            update: { appFolderId: targetFolderId },
            create: { publicId, appFolderId: targetFolderId },
          })
        )
      );
      results.upserted = res.length;
    } else if (action === "unassign") {
      // On retire l’affectation en supprimant les lignes
      const res = await prisma.mediaIndex.deleteMany({
        where: { publicId: { in: ids } },
      });
      results.deleted = res.count;
    } else {
      return ok(
        { error: "action invalide (attendu: 'assign' ou 'unassign')." },
        400
      );
    }

    return ok({
      ok: true,
      action,
      appFolderId: targetFolderId ?? undefined, // une seule clé, pas de doublon
      ...results,
    });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur assignation." }, 500);
  }
}

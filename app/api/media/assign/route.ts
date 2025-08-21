// app/api/media/assign/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "../../_admin";

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/media/assign
 * Body:
 * {
 *   action: "assign" | "unassign",      // défaut: "assign"
 *   appFolderId?: "xxx",                // id dossier cible (alias: folderId)
 *   folderId?: "xxx",                   // alias accepté pour compatibilité
 *   publicIds: ["a/b/c1", "a/b/c2"]     // ou public_ids / ids
 * }
 *
 * Schéma: MediaIndex.appFolderId (nullable)
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));

    const action: "assign" | "unassign" =
      (String(body.action || "assign").toLowerCase() as any) === "unassign"
        ? "unassign"
        : "assign";

    // On accepte appFolderId OU folderId en entrée
    const targetFolderId: string | null =
      (body.appFolderId ?? body.folderId ?? null) !== null
        ? String(body.appFolderId ?? body.folderId)
        : null;

    const list: string[] = (body.publicIds || body.public_ids || body.ids || []).filter(Boolean);
    if (!Array.isArray(list) || list.length === 0) {
      return ok({ error: "Aucun publicId fourni." }, 400);
    }

    if (action === "assign") {
      if (!targetFolderId) {
        return ok({ error: "folderId (ou appFolderId) requis pour 'assign'." }, 400);
      }
      // Vérifier que le dossier existe
      const exists = await prisma.appFolder.findUnique({
        where: { id: targetFolderId },
        select: { id: true },
      });
      if (!exists) return ok({ error: `Dossier introuvable: ${targetFolderId}` }, 404);
    }

    const results = await prisma.$transaction(async (tx) => {
      let updated = 0,
        created = 0;

      for (const publicId of list) {
        const existing = await tx.mediaIndex.findUnique({ where: { publicId } });

        if (action === "unassign") {
          if (existing) {
            await tx.mediaIndex.update({
              where: { publicId },
              data: { appFolderId: null },
            });
            updated++;
          } else {
            // on garde une trace "non assignée"
            await tx.mediaIndex.create({
              data: { publicId, appFolderId: null },
            });
            created++;
          }
          continue;
        }

        // action === "assign"
        if (existing) {
          await tx.mediaIndex.update({
            where: { publicId },
            data: { appFolderId: targetFolderId! },
          });
          updated++;
        } else {
          await tx.mediaIndex.create({
            data: { publicId, appFolderId: targetFolderId! },
          });
          created++;
        }
      }

      return { updated, created, total: list.length };
    });

    return ok({
      ok: true,
      action,
      folderId: targetFolderId, // alias lisible côté client
      appFolderId: targetFolderId,
      ...results,
    });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur assignation médias." }, 500);
  }
}

// app/api/folders/move/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "../../_admin"; // depuis app/api/folders/move -> ../../_admin

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

/**
 * Déplace une liste de médias (publicIds) d’un dossier vers un autre.
 *
 * Body JSON attendu :
 * {
 *   "publicIds": ["famille/Evenements/.../img1", "..."],
 *   "fromFolderId": "xxx"   // optionnel : ne bouge que si ça matche la valeur actuelle
 *   "toFolderId":   "yyy"   // requis : destination
 * }
 *
 * Schéma Prisma: MediaIndex.appFolderId (⚠️ pas folderId)
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const fromFolderId: string | undefined =
      body.fromFolderId ?? body.from ?? undefined;
    const toFolderId: string | null = body.toFolderId ?? body.to ?? null;
    const list: string[] = (body.publicIds || body.public_ids || body.ids || []).filter(Boolean);

    if (!Array.isArray(list) || list.length === 0) {
      return ok({ error: "Aucun publicId fourni." }, 400);
    }
    if (!toFolderId) {
      return ok({ error: "toFolderId requis." }, 400);
    }

    // Vérifier la destination
    const dest = await prisma.appFolder.findUnique({ where: { id: String(toFolderId) } });
    if (!dest) return ok({ error: `Folder destination introuvable: ${toFolderId}` }, 404);

    const results = await prisma.$transaction(async (tx) => {
      let updated = 0, created = 0, skipped = 0;

      for (const publicId of list) {
        const existing = await tx.mediaIndex.findUnique({ where: { publicId } });

        if (existing) {
          // ⚠️ utiliser appFolderId (plus folderId)
          if (typeof fromFolderId === "undefined" || existing.appFolderId === fromFolderId) {
            await tx.mediaIndex.update({
              where: { publicId },
              data: { appFolderId: toFolderId },
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await tx.mediaIndex.create({
            data: { publicId, appFolderId: toFolderId },
          });
          created++;
        }
      }

      return { updated, created, skipped, total: list.length };
    });

    return ok({ ok: true, ...results, toFolderId, fromFolderId });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur déplacement de médias." }, 500);
  }
}

// alias PATCH
export const PATCH = POST;

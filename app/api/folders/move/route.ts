// app/api/folders/move/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, type MediaIndex as MediaIndexType } from "@prisma/client";
import { requireAdmin } from "../../_admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Déplace des médias (public_id) d'un dossier à un autre (affectation BD).
 * Body JSON:
 *   {
 *     "toFolderId": "xxx" | null,       // null => désaffecter
 *     "fromFolderId": "yyy" | undefined // optionnel: ne déplacer que s'ils viennent de ce dossier
 *     "public_ids": ["a","b","c"]
 *   }
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { toFolderId, fromFolderId, public_ids } = await req.json();

    const ids: string[] = Array.isArray(public_ids)
      ? public_ids.filter(Boolean)
      : [];

    if (!("toFolderId" in (await req.json().catch(() => ({}))) ?? true)) {
      // sécurité défensive ; mais on valide juste ci-dessous
    }

    if (ids.length === 0) return ok({ error: "Aucun public_id fourni." }, 400);
    // toFolderId peut être null (désaffecter)
    if (typeof toFolderId === "undefined")
      return ok({ error: "toFolderId requis (ou null pour désaffecter)." }, 400);

    const moved: MediaIndexType[] = [];
    const updated: MediaIndexType[] = [];
    const created: MediaIndexType[] = [];
    const skipped: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const publicId of ids) {
        const existing = await tx.mediaIndex.findUnique({ where: { publicId } });

        // Si un filtre fromFolderId est donné, on le respecte
        if (existing) {
          if (
            typeof fromFolderId === "undefined" ||
            existing.folderId === fromFolderId
          ) {
            const rec = await tx.mediaIndex.update({
              where: { publicId },
              data: { folderId: toFolderId ?? null },
            });
            updated.push(rec);
            moved.push(rec);
          } else {
            skipped.push(publicId);
          }
        } else {
          // Pas d'entrée existante: on crée seulement si toFolderId != null
          if (toFolderId == null) {
            skipped.push(publicId);
            continue;
          }
          const rec = await tx.mediaIndex.create({
            data: { publicId, folderId: toFolderId },
          });
          created.push(rec);
          moved.push(rec);
        }
      }
    });

    return ok({
      ok: true,
      count: moved.length,
      updated: updated.length,
      created: created.length,
      skipped,
    });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur déplacement (folders/move)." }, 400);
  }
}

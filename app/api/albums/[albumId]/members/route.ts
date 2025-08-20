// app/api/albums/[albumId]/members/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const bad = (msg: string, status = 400) => ok({ error: msg }, status);

/**
 * Liste les dossiers membres d’un album (liens AlbumFolderLink).
 * Retour : { members: Array<{id,name,parentId,createdAt}> }
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ albumId: string }> } // ← Next 15 : params est un Promise
) {
  try {
    const { albumId } = await ctx.params;
    if (!albumId) return bad("albumId manquant", 400);

    // On lit les liens puis on récupère les infos dossiers
    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      orderBy: { createdAt: "desc" },
      select: {
        folderId: true,
        folder: {
          select: { id: true, name: true, parentId: true, createdAt: true },
        },
      },
    });

    const members = links
      .map((l) => l.folder)
      .filter(Boolean) as Array<{ id: string; name: string; parentId: string | null; createdAt: Date }>;

    return ok({ members });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET /api/albums/[albumId]/members", 500);
  }
}

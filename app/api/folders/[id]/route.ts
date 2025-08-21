// app/api/folders/[id]/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin"; // <-- ajuste le chemin si besoin

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

async function isAlbumFolderId(id: string) {
  const f = await prisma.appFolder.findUnique({
    where: { id },
    select: { parentId: true },
  });
  if (!f?.parentId) return false;
  const p = await prisma.appFolder.findUnique({
    where: { id: f.parentId },
    select: { name: true },
  });
  return p?.name === "Albums";
}

// GET /api/folders/:id  → détail simple
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const item = await prisma.appFolder.findUnique({
    where: { id },
    select: { id: true, name: true, parentId: true, createdAt: true },
  });
  return ok({ item });
}

// PATCH /api/folders/:id  → rename / changer le parent
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { name, parentId } = await req.json().catch(() => ({}));

  if (await isAlbumFolderId(id)) {
    const deny = await requireAdmin(req);
    if (deny) return deny;
  }

  const data: Record<string, any> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof parentId === "string") data.parentId = parentId;

  if (!Object.keys(data).length) return ok({ error: "Rien à mettre à jour" }, 400);

  try {
    const item = await prisma.appFolder.update({
      where: { id },
      data,
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item });
  } catch (e: any) {
    const msg = e?.message || "Erreur PATCH /folders/[id]";
    return ok({ error: msg }, 400);
  }
}

// DELETE /api/folders/:id  → supprime le dossier
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  try {
    if (await isAlbumFolderId(id)) {
      // supprimer un album = réservé admin
      const deny = await requireAdmin(req);
      if (deny) return deny;
      // on ne touche pas aux médias; on nettoie juste les liens d’album
      await prisma.albumFolderLink.deleteMany({ where: { albumId: id } });
    }

    // Si ta FK MediaIndex.appFolderId est en SET NULL (cas par défaut pour optionnel),
    // la suppression ne cassera rien. Sinon, ajoute ici un SET NULL manuel.
    // await prisma.mediaIndex.updateMany({ where: { appFolderId: id }, data: { appFolderId: null } });

    const item = await prisma.appFolder.delete({
      where: { id },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });

    return ok({ item });
  } catch (e: any) {
    // P2025 = record not found
    const msg = e?.code === "P2025" ? "Dossier introuvable." : e?.message || "Erreur DELETE /folders/[id]";
    return ok({ error: msg }, 400);
  }
}

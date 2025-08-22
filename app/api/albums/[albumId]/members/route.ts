// app/api/albums/[albumId]/members/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin";

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

async function isUnderAlbums(id: string) {
  // remonte d’un cran et teste si le parent s’appelle “Albums”
  const f = await prisma.appFolder.findUnique({ where: { id }, select: { parentId: true } });
  if (!f?.parentId) return false;
  const p = await prisma.appFolder.findUnique({ where: { id: f.parentId }, select: { name: true } });
  return p?.name === "Albums";
}

// GET → { album, folders }
export async function GET(_req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  try {
    const { albumId } = await ctx.params;

    const album = await prisma.appFolder.findUnique({
      where: { id: albumId },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    if (!album) return ok({ error: "Album introuvable" }, 404);

    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      select: { folderId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const ids = links.map(l => l.folderId);
    const folders = ids.length
      ? await prisma.appFolder.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, parentId: true, createdAt: true },
        })
      : [];

    return ok({ album, folders });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur GET members" }, 500);
  }
}

// POST { folderId } → ajoute un dossier **de la Galerie** (jamais un dossier sous “Albums”)
export async function POST(req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const folderId = String(body.folderId || "").trim();
    if (!albumId || !folderId) return ok({ error: "albumId/folderId requis" }, 400);

    // refuse si le dossier candidat est sous “Albums”
    if (await isUnderAlbums(folderId)) {
      return ok({ error: "On ne peut pas ajouter un dossier qui vit sous « Albums »." }, 400);
    }

    await prisma.albumFolderLink.create({ data: { albumId, folderId } });
    return ok({ ok: true, albumId, folderId });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (/Unique constraint/i.test(msg)) return ok({ ok: true, already: true });
    return ok({ error: msg || "Erreur POST members" }, 400);
  }
}

// DELETE { folderId }
export async function DELETE(req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const folderId = String(body.folderId || "").trim();
    if (!albumId || !folderId) return ok({ error: "albumId/folderId requis" }, 400);

    await prisma.albumFolderLink.delete({
      where: { albumId_folderId: { albumId, folderId } },
    });

    return ok({ ok: true, albumId, folderId, removed: true });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur DELETE members" }, 400);
  }
}

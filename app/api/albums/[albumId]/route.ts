// app/api/albums/[albumId]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin";

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
const bad = (m: string, s = 400) => ok({ error: m }, s);

async function assertAlbum(albumId: string) {
  const row = await prisma.appFolder.findUnique({
    where: { id: albumId },
    select: { id: true, name: true, parentId: true },
  });
  if (!row) throw new Error("Album introuvable.");

  if (!row.parentId) throw new Error("Ce dossier n'est pas un album.");

  const parent = await prisma.appFolder.findUnique({
    where: { id: row.parentId },
    select: { name: true },
  });
  if (parent?.name !== "Albums")
    throw new Error('Ce dossier n’est pas sous la racine "Albums".');

  return row;
}

// GET: détail minimal (utile si besoin)
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await ctx.params;
    const album = await assertAlbum(albumId);
    return ok({ album });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET album", 500);
  }
}

// PATCH: renommer
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const n = String(body?.name ?? body?.newName ?? "").trim();
    if (!n) return bad("Champ 'name' requis.");

    await assertAlbum(albumId);

    const item = await prisma.appFolder.update({
      where: { id: albumId },
      data: { name: n },
      select: { id: true, name: true },
    });

    return ok({ ok: true, item });
  } catch (e: any) {
    return bad(e?.message || "Erreur PATCH album");
  }
}

// DELETE: supprime l'album (d'abord les liens)
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;

    await assertAlbum(albumId);

    await prisma.albumFolderLink.deleteMany({ where: { albumId } });

    const item = await prisma.appFolder.delete({
      where: { id: albumId },
      select: { id: true, name: true },
    });

    return ok({ ok: true, removed: true, item });
  } catch (e: any) {
    return bad(e?.message || "Erreur DELETE album");
  }
}

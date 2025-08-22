// app/api/albums/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin";

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
const bad = (m: string, s = 400) => ok({ error: m }, s);

// Assure l'existence du dossier racine "Albums" (côté BD), et le renvoie
async function ensureAlbumsRoot() {
  let row = await prisma.appFolder.findFirst({
    where: { name: "Albums", parentId: null },
    select: { id: true, name: true },
  });
  if (!row) {
    row = await prisma.appFolder.create({
      data: { name: "Albums", parentId: null },
      select: { id: true, name: true },
    });
  }
  return row;
}

/**
 * POST /api/albums  { name: string }
 * -> crée l'album sous la racine BD "Albums" (pas de dossier Cloudinary, pas de dossier Galerie)
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name ?? body?.title ?? "").trim();
    if (!name) return bad("Nom d'album requis.");

    const albumsRoot = await ensureAlbumsRoot();

    const item = await prisma.appFolder.create({
      data: { name, parentId: albumsRoot.id },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });

    return ok({ ok: true, item }, 201);
  } catch (e: any) {
    return bad(e?.message || "Erreur création d'album", 500);
  }
}

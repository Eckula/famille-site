// app/api/albums/[albumId]/members/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin"; // ✅ 3 niveaux

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

const bad = (message: string, status = 400) => ok({ error: message }, status);

// GET /api/albums/[albumId]/members
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ albumId: string }> } // ✅ on attend params
) {
  try {
    const { albumId } = await ctx.params;
    if (!albumId) return bad("albumId manquant", 400);

    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      select: { folderId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return ok({ members: links });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET members", 500);
  }
}

// POST /api/albums/[albumId]/members  { folderId }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const folderId = String(body.folderId || "").trim();
    if (!albumId || !folderId) return bad("albumId/folderId requis", 400);

    // crée le lien (clé primaire composite albumId+folderId)
    await prisma.albumFolderLink.create({ data: { albumId, folderId } });
    return ok({ ok: true, albumId, folderId });
  } catch (e: any) {
    const msg = String(e?.message || e);
    // si déjà présent, on considère OK idempotent
    if (/Unique constraint/i.test(msg)) return ok({ ok: true, already: true });
    return bad(msg || "Erreur POST members", 400);
  }
}

// DELETE /api/albums/[albumId]/members  { folderId }
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const folderId = String(body.folderId || "").trim();
    if (!albumId || !folderId) return bad("albumId/folderId requis", 400);

    await prisma.albumFolderLink.delete({
      where: { albumId_folderId: { albumId, folderId } },
    });

    return ok({ ok: true, albumId, folderId, removed: true });
  } catch (e: any) {
    return bad(e?.message || "Erreur DELETE members", 400);
  }
}

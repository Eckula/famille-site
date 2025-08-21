// app/api/folders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";         // ✅ singleton
import { requireAdmin } from "@/app/api/_admin";  // ✅ helper (retour NextResponse | null)

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

// utils
async function idFromName(name?: string | null) {
  if (!name) return null;
  const f = await prisma.appFolder.findFirst({
    where: { name, parentId: null },
    select: { id: true },
  });
  return f?.id ?? null;
}
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

export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;

    // 1) item par id
    const id = sp.get("id");
    if (id) {
      const item = await prisma.appFolder.findUnique({
        where: { id },
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      return ok({ item });
    }

    // 2) listing
    const parent = sp.get("parent");         // id parent
    const parentName = sp.get("parentName"); // "Albums", "Evenements" ...
    const root = sp.get("root");             // "gallery" => racine galerie (hors systèmes)
    const recent = Number(sp.get("recent") || 0); // ✅ pour le mini-sélecteur

    if (parent) {
      // Compat Galerie: { folders, parent }
      const parentRow = await prisma.appFolder.findUnique({
        where: { id: parent },
        select: { id: true, name: true, parentId: true },
      });
      const folders = await prisma.appFolder.findMany({
        where: { parentId: parent },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        select: {
          id: true, name: true, parentId: true, createdAt: true,
          _count: { select: { children: true, media: true } },
        },
      });
      return ok({ folders, parent: parentRow });
    }

    if (parentName) {
      const pid = await idFromName(parentName);
      const items = await prisma.appFolder.findMany({
        where: { parentId: pid },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      return ok({ items });
    }

    if (recent > 0) {
      // ✅ N derniers dossiers (hors racines), utile au sélecteur d’album
      const items = await prisma.appFolder.findMany({
        where: { parentId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: Math.min(recent, 200),
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      return ok({ items });
    }

    if (root === "gallery") {
      // Compat Galerie: { folders, parent: null }
      const folders = await prisma.appFolder.findMany({
        where: {
          parentId: null,
          NOT: { name: { in: ["Albums", "Événements", "Evenements", "Documents"] } },
        },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        select: {
          id: true, name: true, parentId: true, createdAt: true,
          _count: { select: { children: true, media: true } },
        },
      });
      return ok({ folders, parent: null });
    }

    // racine par défaut
    const items = await prisma.appFolder.findMany({
      where: { parentId: null },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ items });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur GET /folders" }, 500);
  }
}

export async function POST(req: Request) {
  try {
    const { name, parentId, parentName } = await req.json();
    const n = String(name || "").trim();
    if (!n) return ok({ error: "Nom du dossier requis." }, 400);

    let pid = parentId ?? null;
    if (!pid && parentName) {
      const parentRow = await prisma.appFolder.findFirst({
        where: { name: parentName, parentId: null },
        select: { id: true },
      });
      pid = parentRow?.id ?? null;
    }

    // créer un ALBUM => admin
    if (pid) {
      const p = await prisma.appFolder.findUnique({
        where: { id: pid },
        select: { name: true },
      });
      if (p?.name === "Albums") {
        const deny = await requireAdmin(req);
        if (deny) return deny;
      }
    }

    const item = await prisma.appFolder.create({
      data: { name: n, parentId: pid },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item }, 201);
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur POST /folders" }, 400);
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, name, parentId } = await req.json();
    if (!id) return ok({ error: "id requis" }, 400);

    if (await isAlbumFolderId(id)) {
      const deny = await requireAdmin(req);
      if (deny) return deny;
    }

    const data: any = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof parentId === "string") data.parentId = parentId;
    if (!Object.keys(data).length) return ok({ error: "aucun champ à mettre à jour" }, 400);

    const item = await prisma.appFolder.update({
      where: { id },
      data,
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur PATCH /folders" }, 400);
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return ok({ error: "id requis" }, 400);

    if (await isAlbumFolderId(id)) {
      const deny = await requireAdmin(req);
      if (deny) return deny;
      // on ne touche pas aux dossiers/médias → seulement nettoyer les liens
      await prisma.albumFolderLink.deleteMany({ where: { albumId: id } });
    }

    const item = await prisma.appFolder.delete({
      where: { id },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur DELETE /folders" }, 400);
  }
}

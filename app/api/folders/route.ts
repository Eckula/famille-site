// app/api/folders/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/* ---------------- helpers ---------------- */

const SYSTEM_ROOT_NAMES = ["Albums", "Événements", "Evenements", "Documents"] as const;
type SystemRootName = (typeof SYSTEM_ROOT_NAMES)[number];

async function idFromName(name?: string | null) {
  if (!name) return null;
  const f = await prisma.appFolder.findFirst({
    where: { name, parentId: null },
    select: { id: true },
  });
  return f?.id ?? null;
}

async function systemRootIds(): Promise<Record<SystemRootName, string | null>> {
  const out: Record<string, string | null> = {};
  for (const n of SYSTEM_ROOT_NAMES) out[n] = await idFromName(n);
  return out as Record<SystemRootName, string | null>;
}

async function isAlbumFolderId(id: string) {
  const row = await prisma.appFolder.findUnique({ where: { id }, select: { parentId: true } });
  if (!row?.parentId) return false;
  const p = await prisma.appFolder.findUnique({ where: { id: row.parentId }, select: { name: true } });
  return p?.name === "Albums";
}

/* ---------------- GET ---------------- */

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

    // paramètres “listing”
    const parent        = sp.get("parent");           // id parent
    const parentName    = sp.get("parentName");       // ex: Albums / Evenements
    const root          = sp.get("root");             // "gallery" => racine "galerie"
    const recent        = Number(sp.get("recent") || 0);
    const excludeAlbums = sp.get("excludeAlbums") === "1";
    const showSystem    = sp.get("showSystem") === "1";

    const sysIds = await systemRootIds();
    const albumsRootId = sysIds["Albums"];

    // 2) enfants d’un parent par id
    if (parent) {
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

    // 3) enfants d’un parent par nom (Albums / Evenements …)
    if (parentName) {
      const pid = await idFromName(parentName);
      const items = await prisma.appFolder.findMany({
        where: { parentId: pid },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      return ok({ items });
    }

    // 4) liste “récentes” (utile pour sélecteurs)
    if (recent > 0) {
      const where: any = { parentId: { not: null } };
      if (excludeAlbums && albumsRootId) where.parentId = { not: albumsRootId };

      const items = await prisma.appFolder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: Math.min(recent, 300),
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      return ok({ items });
    }

    // 5) racine “Galerie” (on masque toujours les racines système)
    if (root === "gallery") {
      const folders = await prisma.appFolder.findMany({
        where: {
          parentId: null,
          NOT: { name: { in: SYSTEM_ROOT_NAMES as unknown as string[] } },
        },
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        select: {
          id: true, name: true, parentId: true, createdAt: true,
          _count: { select: { children: true, media: true } },
        },
      });
      return ok({ folders, parent: null });
    }

    // 6) racine par défaut : par **défaut** on masque les systèmes
    const whereRoot = showSystem
      ? { parentId: null }
      : { parentId: null, NOT: { name: { in: SYSTEM_ROOT_NAMES as unknown as string[] } } };

    const items = await prisma.appFolder.findMany({
      where: whereRoot,
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ items });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur GET /folders" }, 500);
  }
}

/* ---------------- POST ---------------- */

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

    // créer sous “Albums” => réservé admin
    if (pid) {
      const p = await prisma.appFolder.findUnique({ where: { id: pid }, select: { name: true } });
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

/* ---------------- PATCH ---------------- */

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

/* ---------------- DELETE ---------------- */

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return ok({ error: "id requis" }, 400);

    if (await isAlbumFolderId(id)) {
      // supprimer un album => admin, et on nettoie les liens uniquement
      const deny = await requireAdmin(req);
      if (deny) return deny;
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

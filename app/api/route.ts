// app/api/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";               // <- utilise l'alias centralisé
import { v2 as cloudinary } from "cloudinary";

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();
const MAX = 5000;

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes.");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

async function searchPaginated(expr: string, max = MAX) {
  const out: any[] = [];
  let cursor: string | undefined;
  while (out.length < max) {
    // @ts-ignore
    const q = cloudinary.search.expression(expr).sort_by("created_at", "desc").max_results(500);
    if (cursor) (q as any).next_cursor(cursor);
    const res = await q.execute();
    if (Array.isArray(res?.resources)) out.push(...res.resources);
    cursor = res?.next_cursor;
    if (!cursor) break;
  }
  return out.slice(0, max);
}

async function adminListByPrefix(prefix?: string) {
  const combos: Array<{ resource_type: "image" | "video" | "raw"; type: "upload" }> = [
    { resource_type: "image", type: "upload" },
    { resource_type: "video", type: "upload" },
    { resource_type: "raw", type: "upload" },
  ];
  const all: any[] = [];
  for (const c of combos) {
    let next_cursor: string | undefined;
    do {
      // @ts-ignore
      const res = await cloudinary.api.resources({ ...c, ...(prefix ? { prefix } : {}), max_results: 500, next_cursor });
      if (Array.isArray(res?.resources)) all.push(...res.resources);
      next_cursor = res?.next_cursor;
    } while (next_cursor && all.length < MAX);
  }
  return all;
}

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    ensureCloudinary();

    // 1) Dossiers BD
    const folders = await prisma.appFolder.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });

    // 2) Médias présents sous le préfixe ROOT (Cloudinary)
    const rootExpr = `folder="${ROOT}/*"`;
    const [img, vid, raw] = await Promise.all([
      searchPaginated(`resource_type:image AND ${rootExpr}`),
      searchPaginated(`resource_type:video AND ${rootExpr}`),
      searchPaginated(`resource_type:raw AND ${rootExpr}`),
    ]);

    let allUnderRoot: any[] = [...img, ...vid, ...raw];
    if (allUnderRoot.length === 0) {
      const byPrefix = await adminListByPrefix(`${ROOT}/`);
      allUnderRoot = byPrefix;
    }
    if (allUnderRoot.length === 0) {
      const global = await adminListByPrefix(undefined);
      allUnderRoot = ROOT
        ? global.filter((r: any) => String(r.public_id || "").startsWith(`${ROOT}/`))
        : global;
    }
    const setRoot = new Set((allUnderRoot || []).map((r: any) => r.public_id));

    // 3a) Comptage par dossier via groupBy (clé = appFolderId)
    const grouped = await prisma.mediaIndex.groupBy({
      by: ["appFolderId"],
      where: { appFolderId: { not: null } },
      _count: { _all: true },
    });
    const byId: Record<string, number> = {};
    for (const row of grouped) {
      if (row.appFolderId) byId[row.appFolderId] = row._count._all;
    }

    // 3b) Affectations qui existent sous ROOT (pour calculer "unassigned")
    const indexPublicIds = await prisma.mediaIndex.findMany({
      select: { publicId: true },
    });
    const assignedSetInRoot = new Set(
      indexPublicIds.filter(r => setRoot.has(r.publicId)).map(r => r.publicId)
    );

    // 4) Unassigned = médias sous ROOT - affectations sous ROOT
    const unassigned = Math.max(0, setRoot.size - assignedSetInRoot.size);

    // Aliases pour compatibilité
    return ok({
      folders,
      counts: { unassigned, byId },
      mediaCount: byId,
      mediaCountByFolderId: byId,
      byFolderId: byId,
      unassigned,
      ts: Date.now(),
    });
  } catch (e: any) {
    console.error("[GET /api]", e);
    return NextResponse.json({ error: e?.message || "Erreur dossiers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const parentId =
      body?.parentId === undefined || body?.parentId === null ? null : String(body.parentId);

    if (!name) return NextResponse.json({ error: "name requis" }, { status: 400 });

    const created = await prisma.appFolder.create({ data: { name, parentId } });
    return NextResponse.json(created, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Nom déjà utilisé" }, { status: 409 });
    return NextResponse.json({ error: e?.message || "Erreur création" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

/**
 * GET params:
 *  - folder   : Cloudinary path prefix (ex: "famille/Evenements/2025-08-20 …")
 *  - folderId : AppFolder id (DB) → resolve to public_ids via Prisma, then Cloudinary lookup
 *  - view     : "folder" (default) | "unassigned" (DB entries with folderId = null)
 *  - tab      : images | videos | audio | documents | all
 *  - page     : Cloudinary next_cursor
 *  - perPage  : ≤ 100 (default 60)
 *  - q        : simple filter (public_id / filename)
 *  - sort     : created_desc | created_asc
 */
const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();
const MEDIA_TTL_MS = Number(process.env.MEDIA_LIST_TTL_MS || 5 * 60 * 1000);
const MAX_RESULTS = 100;

type Kind = "image" | "video" | "audio" | "document";

// Cloudinary
function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) {
    throw new Error("Cloudinary non configuré (cloud_name / api_key / api_secret).");
  }
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

// in-memory cache
type CacheEntry = { at: number; payload: any };
const CACHE = new Map<string, CacheEntry>();
const normKey = (u: URL) => {
  const x = new URL(u.toString());
  x.searchParams.delete("ts");
  return x.pathname + "?" + x.searchParams.toString();
};
const getCache = (k: string) => {
  const e = CACHE.get(k);
  if (!e) return null;
  if (Date.now() - e.at > MEDIA_TTL_MS) return null;
  return e.payload;
};
const setCache = (k: string, v: any) => CACHE.set(k, { at: Date.now(), payload: v });
const ok = (p: any, ttl = MEDIA_TTL_MS) =>
  NextResponse.json(p, { headers: { "Cache-Control": `s-maxage=${Math.floor(ttl / 1000)}` } });
const err = (status: number, message: string, extra?: any) =>
  NextResponse.json({ error: message, ...extra }, { status });

// mapping
const AUDIO_EXT = ["mp3", "m4a", "aac", "wav", "flac", "ogg", "oga"];
function guessKind(rt: string, fmt?: string): Kind {
  const f = (fmt || "").toLowerCase();
  if (rt === "image") return f === "pdf" ? "document" : "image";
  if (rt === "video") return AUDIO_EXT.includes(f) ? "audio" : "video";
  return "document";
}
function mapItem(r: any) {
  const rt = (r.resource_type || "image").toLowerCase();
  const kind = guessKind(rt, r.format);
  const url = r.secure_url || r.url;
  return {
    public_id: r.public_id as string,
    title: (r.original_filename as string) || (r.public_id as string),
    url,
    thumb: kind === "image" ? url : kind === "video" ? r.thumbnail_url || url : undefined,
    format: r.format as string | undefined,
    kind,
    createdAt: r.created_at as string | undefined,
  };
}
function filterByTab(list: any[], tab: string) {
  switch (tab) {
    case "images": return list.filter((x) => x.kind === "image");
    case "videos": return list.filter((x) => x.kind === "video");
    case "audio": return list.filter((x) => x.kind === "audio");
    case "documents": return list.filter((x) => x.kind === "document");
    default: return list;
  }
}

// 1) Cloudinary prefix listing
async function listByFolderPrefix(opts: {
  folder: string; tab: string; page?: string; perPage: number; sortDir: "asc" | "desc";
}) {
  ensureCloudinary();
  const { folder, tab, page, perPage, sortDir } = opts;
  const base = {
    type: "upload" as const,
    prefix: `${folder}/`,
    max_results: Math.min(perPage, MAX_RESULTS),
    next_cursor: page,
    direction: sortDir,
  };
  const kinds: Array<"image" | "video" | "raw"> =
    tab === "images" ? ["image"]
      : tab === "videos" ? ["video"]
      : (tab === "audio" || tab === "documents") ? ["raw"]
      : ["image", "video", "raw"];

  let resources: any[] = [];
  let next: string | undefined;
  for (const rt of kinds) {
    const res = await cloudinary.api.resources({ ...base, resource_type: rt });
    if (Array.isArray(res?.resources)) resources.push(...res.resources);
    next = next || res?.next_cursor;
  }

  if (kinds.length > 1) {
    const dir = sortDir === "asc" ? 1 : -1;
    resources.sort((a, b) => dir * (+new Date(a.created_at) - +new Date(b.created_at)));
    resources = resources.slice(0, perPage);
  }
  return { items: resources.map(mapItem), next };
}

// 2) DB folderId → Cloudinary lookups
async function listByFolderId(opts: { folderId: string; tab: string }) {
  const { folderId, tab } = opts;

  const rows = await prisma.mediaIndex.findMany({
    where: { folderId },
    select: { publicId: true },
  });
  const ids = Array.from(new Set(rows.map((r) => r.publicId)));
  if (ids.length === 0) return { items: [] };

  ensureCloudinary();

  const left = new Set(ids);
  const found: any[] = [];
  async function byIds(rt: "image" | "video" | "raw") {
    const arr = Array.from(left);
    for (let i = 0; i < arr.length; i += 100) {
      const idsChunk = arr.slice(i, i + 100);
      if (!idsChunk.length) break;
      try {
        const res = await cloudinary.api.resources_by_ids(idsChunk, { resource_type: rt, type: "upload" } as any);
        const list = Array.isArray(res?.resources) ? res.resources : Array.isArray(res) ? res : [];
        for (const r of list) { found.push(r); left.delete(r.public_id); }
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || String(e);
        if (/rate\s*limit/i.test(msg)) break;
      }
    }
  }
  await byIds("image"); if (left.size) await byIds("video"); if (left.size) await byIds("raw");

  let items = found.map(mapItem);
  items = filterByTab(items, tab);
  return { items };
}

// 3) “unassigned” = folderId null
async function listUnassigned(opts: { tab: string; perPage: number }) {
  const { tab, perPage } = opts;
  const rows = await prisma.mediaIndex.findMany({
    where: { folderId: null },
    select: { publicId: true },
    take: Math.min(perPage * 3, 300),
  });
  const ids = Array.from(new Set(rows.map((r) => r.publicId)));
  if (ids.length === 0) return { items: [] };

  try { ensureCloudinary(); } catch { return { items: [] }; }

  const left = new Set(ids);
  const found: any[] = [];
  async function byIds(rt: "image" | "video" | "raw") {
    const arr = Array.from(left);
    for (let i = 0; i < arr.length; i += 100) {
      const idsChunk = arr.slice(i, i + 100);
      if (!idsChunk.length) break;
      try {
        const res = await cloudinary.api.resources_by_ids(idsChunk, { resource_type: rt, type: "upload" } as any);
        const list = Array.isArray(res?.resources) ? res.resources : Array.isArray(res) ? res : [];
        for (const r of list) { found.push(r); left.delete(r.public_id); if (found.length >= perPage) break; }
        if (found.length >= perPage) break;
      } catch {}
    }
  }
  const types: Array<"image" | "video" | "raw"> =
    tab === "images" ? ["image"] : tab === "videos" ? ["video"]
      : (tab === "audio" || tab === "documents") ? ["raw"] : ["image", "video", "raw"];
  for (const rt of types) { if (found.length >= perPage) break; await byIds(rt); }

  let items = found.map(mapItem).slice(0, perPage);
  items = filterByTab(items, tab);
  return { items };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = normKey(url);
    const cached = getCache(key);
    if (cached) return ok(cached);

    const view = (url.searchParams.get("view") || "folder").toLowerCase();
    const folder = url.searchParams.get("folder") || undefined;
    const folderId = url.searchParams.get("folderId") || undefined;
    const tab = (url.searchParams.get("tab") || "all").toLowerCase();
    const page = url.searchParams.get("page") || undefined;
    const perPage = Math.min(Number(url.searchParams.get("perPage") || 60), MAX_RESULTS);
    const sortDir = (url.searchParams.get("sort") || "created_desc").toLowerCase() === "created_asc" ? "asc" : "desc";
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    if (view === "unassigned") {
      const { items } = await listUnassigned({ tab, perPage });
      const filtered = q ? items.filter(i => (i.public_id||"").toLowerCase().includes(q) || (i.title||"").toLowerCase().includes(q)) : items;
      const payload = { items: filtered };
      setCache(key, payload); return ok(payload);
    }

    if (folder) {
      const { items, next } = await listByFolderPrefix({ folder, tab, page, perPage, sortDir });
      const filtered = q ? items.filter(i => (i.public_id||"").toLowerCase().includes(q) || (i.title||"").toLowerCase().includes(q)) : items;
      const payload = { items: filtered, next };
      setCache(key, payload); return ok(payload);
    }

    if (folderId) {
      const { items } = await listByFolderId({ folderId, tab });
      const filtered = q ? items.filter(i => (i.public_id||"").toLowerCase().includes(q) || (i.title||"").toLowerCase().includes(q)) : items;
      const payload = { items: filtered };
      setCache(key, payload); return ok(payload);
    }

    const { items, next } = await listByFolderPrefix({ folder: ROOT, tab, page, perPage, sortDir });
    const payload = { items, next };
    setCache(key, payload); return ok(payload);
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    const url = new URL(req.url);
    const cached = getCache(normKey(url));
    if (cached) return ok(cached, 60_000);
    return err(500, msg || "Erreur interne");
  }
}

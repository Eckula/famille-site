// app/api/media/list/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

/**
 * Paramètres supportés (GET):
 *  - folder   : chemin Cloudinary (ex: "famille/Evenements/2024-04_anniv")
 *  - folderId : id dossier (DB) → on résout en public_ids via Prisma, puis lookup par lots
 *  - view     : "folder" (défaut) | "unassigned" (médias sans dossier DB)
 *  - tab      : images | videos | audio | documents | all (défaut: all)
 *  - page     : next_cursor (pagination Cloudinary)
 *  - perPage  : max 500 (défaut: 60)
 *  - q        : filtre simple (public_id / filename)
 *  - sort     : created_desc | created_asc (défaut: created_desc)
 *  - ts       : nombre → si présent, bypass cache mémoire
 *  - fresh    : "1"    → idem
 */

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();
// ↑ TTL mémoire
const MEDIA_TTL_MS = Number(process.env.MEDIA_LIST_TTL_MS || 5 * 60 * 1000); // 5 min
// ← IMPORTANT : Cloudinary autorise jusqu’à 500 par appel
const MAX_RESULTS = 500;

type Kind = "image" | "video" | "audio" | "document";

// -------------------- Cloudinary config --------------------
function ensureCloudinary() {
  const cn =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as)
    throw new Error(
      "Cloudinary non configuré (cloud_name / api_key / api_secret)."
    );
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

// ---------------------- Cache mémoire ----------------------
type CacheEntry = { at: number; payload: any };
const CACHE = new Map<string, CacheEntry>();

function normKey(u: URL) {
  const x = new URL(u.toString());
  x.searchParams.delete("ts");
  x.searchParams.delete("fresh");
  return x.pathname + "?" + x.searchParams.toString();
}
function getCache(key: string) {
  const e = CACHE.get(key);
  if (!e) return null;
  if (Date.now() - e.at > MEDIA_TTL_MS) return null;
  return e.payload;
}
function setCache(key: string, payload: any) {
  CACHE.set(key, { at: Date.now(), payload });
}

function ok(payload: any, opts: { ttl?: number; noStore?: boolean } = {}) {
  const { ttl = MEDIA_TTL_MS, noStore = false } = opts;
  return NextResponse.json(payload, {
    headers: noStore
      ? { "Cache-Control": "no-store" }
      : { "Cache-Control": `s-maxage=${Math.floor(ttl / 1000)}` },
  });
}
function err(status: number, message: string, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

// ---------------------- Utils mapping ----------------------
const AUDIO_EXT = ["mp3", "m4a", "aac", "wav", "flac", "ogg", "oga"];
function guessKind(rt: string, fmt?: string): Kind {
  const f = (fmt || "").toLowerCase();
  if (rt === "image") return f === "pdf" ? "document" : "image";
  if (rt === "video") return AUDIO_EXT.includes(f) ? "audio" : "video";
  // la plupart des "raw" sont des documents (csv, zip, docx, …)
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
    thumb:
      kind === "image"
        ? url
        : kind === "video"
        ? (r.thumbnail_url || url)
        : undefined,
    format: (r.format as string | undefined) || undefined,
    kind,
    createdAt: (r.created_at as string | undefined) || undefined,
    resource_type: rt,
  };
}
function filterByTab(list: any[], tab: string) {
  switch (tab) {
    case "images":
      return list.filter((x) => x.kind === "image");
    case "videos":
      return list.filter((x) => x.kind === "video");
    case "audio":
      return list.filter((x) => x.kind === "audio");
    case "documents":
      return list.filter((x) => x.kind === "document");
    default:
      return list;
  }
}

// --------------- Impl 1: listing par *folder* (prefix) ---------------
async function listByFolderPrefix(opts: {
  folder: string;
  tab: string;
  page?: string;
  perPage: number;
  sortDir: "asc" | "desc";
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

  // ⬇️ CORRECTION IMPORTANTE : pour "audio", on interroge **video + raw**
  const kinds: Array<"image" | "video" | "raw"> =
    tab === "images"
      ? ["image"]
      : tab === "videos"
      ? ["video"]
      : tab === "audio"
      ? ["video", "raw"]
      : tab === "documents"
      ? ["raw"]
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
    resources.sort(
      (a, b) => dir * (+new Date(a.created_at) - +new Date(b.created_at))
    );
    resources = resources.slice(0, perPage);
  }

  return { items: resources.map(mapItem), next };
}

// ----------- Impl 2: listing par *folderId* (DB + lookup) ------------
async function listByFolderId(opts: {
  folderId: string;
  tab: string;
  page?: string;
  perPage: number;
}) {
  const { folderId, tab } = opts;

  const rows = await prisma.mediaIndex.findMany({
    where: { appFolderId: folderId },
    select: { publicId: true },
  });
  const ids = Array.from(new Set(rows.map((r) => r.publicId)));
  if (ids.length === 0) return { items: [] };

  ensureCloudinary();

  const left = new Set(ids);
  const found: any[] = [];

  async function byIds(rt: "image" | "video" | "raw") {
    const chunk = 100;
    const arr = Array.from(left);
    for (let i = 0; i < arr.length; i += chunk) {
      const idsChunk = arr.slice(i, i + chunk);
      if (!idsChunk.length) break;
      try {
        const res = await cloudinary.api.resources_by_ids(idsChunk, {
          resource_type: rt,
          type: "upload",
        } as any);
        const list = Array.isArray(res?.resources)
          ? res.resources
          : Array.isArray(res)
          ? res
          : [];
        for (const r of list) {
          found.push(r);
          left.delete(r.public_id);
        }
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || String(e);
        if (/rate\s*limit/i.test(msg)) break;
      }
    }
  }

  await byIds("image");
  if (left.size) await byIds("video"); // audio arrive ici
  if (left.size) await byIds("raw");

  let items = found.map(mapItem);
  items = filterByTab(items, tab);
  return { items };
}

// ----------- Impl 3: "unassigned" (médias sans dossier DB) -----------
async function listUnassigned(opts: { tab: string; perPage: number }) {
  const { tab, perPage } = opts;

  const rows = await prisma.mediaIndex.findMany({
    where: { appFolderId: null },
    select: { publicId: true },
    take: Math.min(perPage * 3, 300),
  });
  const ids = Array.from(new Set(rows.map((r) => r.publicId)));
  if (ids.length === 0) return { items: [] };

  try {
    ensureCloudinary();
  } catch {
    return { items: [] };
  }

  // ⬇️ CORRECTION IMPORTANTE : pour "audio", on interroge **video + raw**
  const types: Array<"image" | "video" | "raw"> =
    tab === "images"
      ? ["image"]
      : tab === "videos"
      ? ["video"]
      : tab === "audio"
      ? ["video", "raw"]
      : tab === "documents"
      ? ["raw"]
      : ["image", "video", "raw"];

  const left = new Set(ids);
  const found: any[] = [];

  async function byIds(rt: "image" | "video" | "raw") {
    const chunk = 100;
    const arr = Array.from(left);
    for (let i = 0; i < arr.length; i += chunk) {
      const idsChunk = arr.slice(i, i + chunk);
      if (!idsChunk.length) break;
      try {
        const res = await cloudinary.api.resources_by_ids(idsChunk, {
          resource_type: rt,
          type: "upload",
        } as any);
        const list = Array.isArray(res?.resources)
          ? res.resources
          : Array.isArray(res)
          ? res
          : [];
        for (const r of list) {
          found.push(r);
          left.delete(r.public_id);
          if (found.length >= perPage) break;
        }
        if (found.length >= perPage) break;
      } catch {}
    }
  }

  for (const rt of types) {
    if (found.length >= perPage) break;
    await byIds(rt);
  }

  let items = found.map(mapItem).slice(0, perPage);
  items = filterByTab(items, tab);
  return { items };
}

// --------------------------- Handler ---------------------------
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const hasTs = url.searchParams.has("ts");
    const isFresh = url.searchParams.get("fresh") === "1" || hasTs;

    const cacheKey = normKey(url);
    if (!isFresh) {
      const cached = getCache(cacheKey);
      if (cached) return ok(cached);
    }

    const view = (url.searchParams.get("view") || "folder").toLowerCase();
    const folder = url.searchParams.get("folder") || undefined;
    const folderId = url.searchParams.get("folderId") || undefined;
    const tab = (url.searchParams.get("tab") || "all").toLowerCase();
    const page = url.searchParams.get("page") || undefined;
    const perPage = Math.min(
      Number(url.searchParams.get("perPage") || 60),
      MAX_RESULTS
    );
    const sort =
      (url.searchParams.get("sort") || "created_desc").toLowerCase() ===
      "created_asc"
        ? "asc"
        : "desc";
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();

    // 0) "unassigned"
    if (view === "unassigned") {
      const { items } = await listUnassigned({ tab, perPage });
      const filtered = q
        ? items.filter((i) => {
            const pid = (i.public_id || "").toLowerCase();
            const title = (i.title || "").toLowerCase();
            return pid.includes(q) || title.includes(q);
          })
        : items;
      const payload = { items: filtered };
      if (!isFresh) setCache(cacheKey, payload);
      return ok(payload, { noStore: isFresh });
    }

    // 1) Par chemin Cloudinary
    if (folder) {
      const { items, next } = await listByFolderPrefix({
        folder,
        tab,
        page,
        perPage,
        sortDir: sort,
      });
      const filtered = q
        ? items.filter((i) => {
            const pid = (i.public_id || "").toLowerCase();
            const title = (i.title || "").toLowerCase();
            return pid.includes(q) || title.includes(q);
          })
        : items;
      const payload = { items: filtered, next };
      if (!isFresh) setCache(cacheKey, payload);
      return ok(payload, { noStore: isFresh });
    }

    // 2) Par folderId (DB → Cloudinary by ids)
    if (folderId) {
      const { items } = await listByFolderId({
        folderId,
        tab,
        page,
        perPage,
      });
      const filtered = q
        ? items.filter((i) => {
            const pid = (i.public_id || "").toLowerCase();
            const title = (i.title || "").toLowerCase();
            return pid.includes(q) || title.includes(q);
          })
        : items;
      const payload = { items: filtered };
      if (!isFresh) setCache(cacheKey, payload);
      return ok(payload, { noStore: isFresh });
    }

    // 3) Fallback : liste le ROOT
    const { items, next } = await listByFolderPrefix({
      folder: ROOT,
      tab,
      page,
      perPage,
      sortDir: sort,
    });
    const payload = { items, next };
    if (!isFresh) setCache(cacheKey, payload);
    return ok(payload, { noStore: isFresh });
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    try {
      const url = new URL(req.url);
      const cached = getCache(normKey(url));
      if (cached) return ok(cached, { ttl: 60_000 });
    } catch {}
    return err(500, msg || "Erreur interne");
  }
}

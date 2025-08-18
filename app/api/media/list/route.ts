// app/api/media/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();
const MAX  = Math.min(Number(process.env.MEDIA_MAX_RESULTS || 5000), 5000);
const TTL  = Math.max(30, Number(process.env.MEDIA_CACHE_TTL_SECONDS || 120)) * 1000; // 120s
const AUDIO = ["mp3","m4a","aac","wav","flac","ogg","oga"];

/* ---------------- HTTP ---------------- */
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

/* --------------- Cache + cooldown (mémoire process) --------------- */
type CacheEntry<T=any> = { ts: number; data: T };
const searchCache = new Map<string, CacheEntry<any[]>>();  // "search:<expr>"
const adminCache  = new Map<string, CacheEntry<any[]>>();  // "admin:<prefix|<all>>"
const folderCache = new Map<string, CacheEntry<any[]>>();  // "folder:<folderId>:<tab>"

// horodatage UTC (ms) jusqu’auquel on évite d’appeler Cloudinary
let cooldownUntil = 0;

function getCache<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const e = map.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL) return null;
  return e.data;
}
function setCache<T>(map: Map<string, CacheEntry<T>>, key: string, data: T) {
  map.set(key, { ts: Date.now(), data });
}

function parseRetryAt(msg: string): number | null {
  // ex: "Try again on 2025-08-18 19:00:00 UTC"
  const m = /Try again on ([0-9-]{10}) ([0-9:]{8}) UTC/i.exec(msg);
  if (!m) return null;
  const iso = `${m[1]}T${m[2]}Z`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}
function markCooldownFrom(msg: string) {
  const t = parseRetryAt(msg);
  cooldownUntil = Math.max(cooldownUntil, t ?? (Date.now() + 2 * 60_000)); // 2 min par défaut
}

/* ---------------- Cloudinary wrappers tolérants ---------------- */
async function safeSearch(expr: string, max = MAX) {
  const key = `search:${expr}`;
  const cached = getCache(searchCache, key);
  if (Date.now() < cooldownUntil) return cached ?? [];

  try {
    const out: any[] = [];
    let cursor: string | undefined;
    while (out.length < max) {
      // @ts-ignore
      const q = cloudinary.search.expression(expr).sort_by("created_at","desc").max_results(500);
      if (cursor) (q as any).next_cursor(cursor);
      const res = await q.execute();
      out.push(...(Array.isArray(res?.resources) ? res.resources : []));
      cursor = res?.next_cursor;
      if (!cursor) break;
    }
    const trimmed = out.slice(0, max);
    setCache(searchCache, key, trimmed);
    return trimmed;
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    if (/rate limit/i.test(msg)) markCooldownFrom(msg);
    console.error("[cloudinary.search]", msg);
    return cached ?? [];
  }
}

async function adminList(prefix?: string) {
  const key = `admin:${prefix || "<all>"}`;
  const cached = getCache(adminCache, key);
  if (Date.now() < cooldownUntil) return cached ?? [];

  const all: any[] = [];
  const combos: Array<{ resource_type: "image"|"video"|"raw"; type: "upload" }> = [
    { resource_type: "image", type: "upload" },
    { resource_type: "video", type: "upload" },
    { resource_type: "raw",   type: "upload"  },
  ];

  for (const c of combos) {
    let nc: string | undefined;
    do {
      try {
        // @ts-ignore
        const res = await cloudinary.api.resources({ ...c, ...(prefix ? { prefix } : {}), max_results: 500, next_cursor: nc });
        if (Array.isArray(res?.resources)) all.push(...res.resources);
        nc = res?.next_cursor;
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || String(e);
        if (/rate limit/i.test(msg)) markCooldownFrom(msg);
        console.error("[cloudinary.api.resources]", prefix || "<all>", msg);
        setCache(adminCache, key, all); // partiel/vidé → on met en cache l’état courant
        return all;
      }
    } while (nc && all.length < MAX);
  }
  const trimmed = all.slice(0, MAX);
  setCache(adminCache, key, trimmed);
  return trimmed;
}

/** Récupération par IDs — très peu d’appels (<= 3 par lot de 100). */
async function resourcesByIds(publicIds: string[]) {
  const uniq = Array.from(new Set(publicIds.filter(Boolean)));
  const results = new Map<string, any>();
  let rateLimited = false;

  if (Date.now() < cooldownUntil) {
    return { items: [] as any[], rateLimited: true };
  }

  const chunkSize = 100;
  for (let i = 0; i < uniq.length; i += chunkSize) {
    const chunk = uniq.slice(i, i + chunkSize);
    for (const rt of ["image","video","raw"] as const) {
      try {
        // @ts-ignore
        const res = await cloudinary.api.resources_by_ids(chunk, { resource_type: rt, type: "upload" });
        const arr = Array.isArray(res?.resources) ? res.resources : (Array.isArray(res) ? res : []);
        for (const r of arr) results.set(r.public_id, r);
      } catch (e: any) {
        const msg = e?.error?.message || e?.message || String(e);
        if (/rate limit/i.test(msg)) { markCooldownFrom(msg); rateLimited = true; }
        console.error("[cloudinary.api.resources_by_ids]", rt, msg);
      }
    }
  }
  return { items: Array.from(results.values()), rateLimited };
}

/* ---------------- mapping & filtres ---------------- */
function normalize(x: any) {
  const public_id: string = x.public_id;
  const url: string = x.secure_url || x.url || "";
  const format = String(x.format || "").toLowerCase();
  const rt = String(x.resource_type || "image").toLowerCase() as "image"|"video"|"raw";
  const folder = (x.folder || public_id.split("/").slice(0, -1).join("/")) || "";

  let kind: "image"|"video"|"audio"|"document";
  if (rt === "image")      kind = format === "pdf" ? "document" : "image";
  else if (rt === "video") kind = AUDIO.includes(format) ? "audio" : "video";
  else                     kind = "document";

  return {
    id: x.asset_id || public_id,
    public_id,
    kind,
    title: x.original_filename || public_id.split("/").pop() || "",
    url,
    thumb: x.thumbnail_url || x.secure_url || url,
    createdAt: x.created_at || new Date().toISOString(),
    format,
    folder,
    resource_type: rt,
  };
}

function filterByTab(list: any[], tab: string) {
  switch ((tab || "all").toLowerCase()) {
    case "images":    return list.filter((i) => i.kind === "image");
    case "videos":    return list.filter((i) => i.kind === "video");
    case "audio":     return list.filter((i) => i.kind === "audio");
    case "documents": return list.filter((i) => i.kind === "document");
    default:          return list;
  }
}

/* ---------------- handler ---------------- */
export async function GET(req: NextRequest) {
  try {
    ensureCloudinary();

    const { searchParams } = new URL(req.url);
    const tab      = (searchParams.get("tab") || "all").toLowerCase();
    const view     = (searchParams.get("view") || "unassigned").toLowerCase(); // défaut = Mes fichiers
    const folderId = searchParams.get("folderId") || undefined;
    const debug    = searchParams.get("debug") === "1";

    /* ---- Vue dossier : par IDs, cache + cooldown ---- */
    if (folderId) {
      const cacheKey = `folder:${folderId}:${tab}`;
      const cached = getCache(folderCache, cacheKey) || [];

      const rows = await prisma.mediaIndex.findMany({ where: { folderId }, select: { publicId: true } });
      const ids = rows.map((r) => r.publicId);
      if (ids.length === 0) return ok({ items: [] });

      const { items: found, rateLimited } = await resourcesByIds(ids);
      let items = found.map(normalize);
      items = filterByTab(items, tab);

      if (items.length > 0) setCache(folderCache, cacheKey, items);

      if ((items.length === 0 && rateLimited) || Date.now() < cooldownUntil) {
        const retryAt = cooldownUntil || undefined;
        if (cached.length > 0) return ok({ items: cached, error: "Cloudinary: limite d’API atteinte — affichage mis en cache (peut être partiel)", retryAt });
        return ok({ items: [], error: "Cloudinary: limite d’API atteinte — réessayez un peu plus tard", retryAt });
      }

      return ok(debug ? { mode: "folder", count: items.length, items, cooldownUntil } : { items });
    }

    /* ---- Parcours global/root pour all/assigned/unassigned ---- */
    const preferGlobal = view === "all";
    const map = new Map<string, any>();

    async function collectRoot() {
      for (const expr of [
        `folder:"${ROOT}"`,
        `folder:"${ROOT}/*"`,
        `public_id:"${ROOT}/*"`,
      ]) {
        const res = await safeSearch(expr, MAX);
        for (const r of res) map.set(r.public_id, r);
        if (map.size >= MAX) break;
      }
      if (map.size === 0) {
        const res = await adminList(`${ROOT}/`);
        for (const r of res) map.set(r.public_id, r);
      }
    }
    async function collectGlobal() {
      const res = await adminList(undefined);
      for (const r of res) map.set(r.public_id, r);
    }

    if (preferGlobal) { await collectGlobal(); if (map.size === 0) await collectRoot(); }
    else              { await collectRoot();  if (map.size === 0) await collectGlobal(); }

    let list = Array.from(map.values()).map(normalize);

    if (view === "unassigned" || view === "assigned") {
      const rows = await prisma.mediaIndex.findMany({ select: { publicId: true } });
      const assigned = new Set(rows.map((r) => r.publicId));
      list = view === "unassigned" ? list.filter((i) => !assigned.has(i.public_id))
                                   : list.filter((i) =>  assigned.has(i.public_id));
    }

    list = filterByTab(list, tab);

    const payload: any = { items: list };
    if (Date.now() < cooldownUntil) payload.retryAt = cooldownUntil;

    return ok(debug ? { mode: "browse", preferGlobal, count: list.length, cooldownUntil, items: list } : payload);
  } catch (e: any) {
    const msg = e?.message || "Erreur interne";
    console.error("[/api/media/list]", msg);
    return ok({ items: [], error: msg });
  }
}

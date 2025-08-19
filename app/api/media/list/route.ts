// app/api/media/list/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

/**
 * Paramètres supportés (GET):
 *  - folder: chemin Cloudinary (EX: "famille/Evenements/2024-04_anniv")
 *  - folderId: (LEGACY) id DB → on résout en public_ids via Prisma, puis lookup par lots
 *  - tab: images | videos | audio | documents | all (defaut: all)
 *  - page: next_cursor (pagination)
 *  - perPage: max 100 (defaut: 60)
 *  - q: filtre simple (public_id / filename) — uniquement pour folder/folderId (client-side)
 *  - sort: created_desc | created_asc (defaut: created_desc)
 */

const prisma = new PrismaClient();

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();
const MEDIA_TTL_MS = Number(process.env.MEDIA_LIST_TTL_MS || 5 * 60 * 1000); // 5 min
const MAX_RESULTS = 100;

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
      "Cloudinary: variables manquantes (cloud_name/api_key/api_secret)."
    );
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

// ---------------------- Cache mémoire ----------------------
type CacheEntry = { at: number; payload: any };
const CACHE = new Map<string, CacheEntry>();

function normKey(u: URL) {
  const x = new URL(u.toString());
  x.searchParams.delete("ts");
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

function ok(payload: any, ttl = MEDIA_TTL_MS) {
  return NextResponse.json(payload, {
    headers: { "Cache-Control": `s-maxage=${Math.floor(ttl / 1000)}` },
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
      kind === "image" ? url : kind === "video" ? r.thumbnail_url || url : undefined,
    format: r.format as string | undefined,
    kind,
    createdAt: r.created_at as string | undefined,
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
  const { folder, tab, page, perPage, sortDir } = opts;

  const base = {
    type: "upload" as const,
    prefix: `${folder}/`,
    max_results: Math.min(perPage, MAX_RESULTS),
    next_cursor: page,
    direction: sortDir,
  };

  // on limite les appels: 1 type par onglet, et pour "all" on fusionne image+video+raw (3 appels max)
  const kinds: Array<"image" | "video" | "raw"> =
    tab === "images"
      ? ["image"]
      : tab === "videos"
      ? ["video"]
      : tab === "audio" || tab === "documents"
      ? ["raw"]
      : ["image", "video", "raw"];

  let resources: any[] = [];
  let next: string | undefined;

  for (const rt of kinds) {
    const res = await cloudinary.api.resources({
      ...base,
      resource_type: rt,
    });
    if (Array.isArray(res?.resources)) resources.push(...res.resources);
    // s’il y a une pagination, on expose le next_cursor du *premier* type appelé
    next = next || res?.next_cursor;
  }

  // pour "all", on trie localement par date
  if (kinds.length > 1) {
    const dir = sortDir === "asc" ? 1 : -1;
    resources.sort(
      (a, b) =>
        dir *
        (+new Date(a.created_at as string) - +new Date(b.created_at as string))
    );
    resources = resources.slice(0, perPage);
  }

  return { items: resources.map(mapItem), next };
}

// ----------- Impl 2: listing par *folderId* (legacy + DB) ------------
async function listByFolderId(opts: {
  folderId: string;
  tab: string;
  page?: string; // ignoré ici
  perPage: number; // ignoré ici (on renvoie tout)
}) {
  const { folderId, tab } = opts;

  const rows = await prisma.mediaIndex.findMany({
    where: { folderId },
    select: { publicId: true },
  });
  const ids = Array.from(new Set(rows.map((r) => r.publicId)));

  // on réduit drastiquement le nombre d’appels: on tente image → video → raw,
  // mais on ne repose PAS les IDs déjà trouvés.
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
        // en cas de rate limit: on retourne ce qu'on a déjà (cache côté route appelante)
        if (/rate\s*limit/i.test(msg)) break;
      }
    }
  }

  await byIds("image");
  if (left.size) await byIds("video");
  if (left.size) await byIds("raw");

  let items = found.map(mapItem);
  items = filterByTab(items, tab);
  return { items };
}

// --------------------------- Handler ---------------------------
export async function GET(req: NextRequest) {
  try {
    ensureCloudinary();

    const url = new URL(req.url);
    const key = normKey(url);
    const cached = getCache(key);
    if (cached) return ok(cached);

    const folder = url.searchParams.get("folder") || undefined;
    const folderId = url.searchParams.get("folderId") || undefined; // legacy
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

    // 1) Dossier explicite par *chemin* → le plus économe (prefix)
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
      setCache(key, payload);
      return ok(payload);
    }

    // 2) Compat: par *folderId* (DB → lookup par lots)
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
      setCache(key, payload);
      return ok(payload);
    }

    // 3) Fallback très léger: on liste le ROOT (évite la Search API globale)
    const { items, next } = await listByFolderPrefix({
      folder: ROOT,
      tab,
      page,
      perPage,
      sortDir: sort,
    });
    const payload = { items, next };
    setCache(key, payload);
    return ok(payload);
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    // s'il existe un cache pour cette clé, on le sert quand même
    const url = new URL(req.url);
    const key = normKey(url);
    const cached = getCache(key);
    if (cached) return ok(cached, 60_000);
    return err(500, msg || "Erreur interne");
  }
}

// app/api/media/folders/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// --- caches mémoire (déjà vus) ---------------------------------------------
const FOLDERS_CACHE = new Map<string, { at: number; data: any }>();
const FOLDERS_TTL = Number(process.env.FOLDERS_TTL_MS || 5 * 60 * 1000);

function ok(json: any, extraHeaders?: Record<string, string>) {
  return NextResponse.json(json, {
    headers: { "Cache-Control": `s-maxage=${Math.floor(FOLDERS_TTL / 1000)}`, ...extraHeaders },
  });
}
function err(status: number, message: string, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status });
}
function parentOf(path: string) { return path.split("/").slice(0, -1).join("/"); }

// --- helpers ----------------------------------------------------------------

// Fallback pour renommer un "dossier" Cloudinary si rename_folder indisponible.
// On déplace toutes les ressources de from/ vers to/ puis on supprime le dossier source.
async function moveFolderByPrefix(from: string, to: string) {
  const types: Array<"image" | "video" | "raw"> = ["image", "video", "raw"];
  for (const rt of types) {
    let next_cursor: string | undefined;
    for (let i = 0; i < 20; i++) { // borné
      const res = await cloudinary.api.resources({
        type: "upload",
        resource_type: rt,
        prefix: `${from}/`,
        max_results: 500,
        next_cursor,
      });
      for (const r of res.resources ?? []) {
        const oldId = r.public_id as string;             // ex: "from/a/b/c"
        const rest  = oldId.slice(from.length + 1);      // "a/b/c"
        const newId = `${to}/${rest}`;                   // "to/a/b/c"
        try {
          await cloudinary.uploader.rename(oldId, newId, { resource_type: rt, overwrite: true });
        } catch { /* on continue pour les autres */ }
      }
      next_cursor = res.next_cursor;
      if (!next_cursor) break;
    }
  }
  // supprime le dossier (vide à ce stade)
  try { await cloudinary.api.delete_folder(from); } catch {}
}

/** GET /api/media/folders?root=<chemin> */
export async function GET(req: NextRequest) {
  const root = req.nextUrl.searchParams.get("root");
  if (!root) return ok({ items: [] });

  const key = `subfolders:${root}`;
  const now = Date.now();
  const cached = FOLDERS_CACHE.get(key);
  if (cached && now - cached.at < FOLDERS_TTL) return ok(cached.data);

  try {
    const res = await cloudinary.api.sub_folders(root);
    const items = (res?.folders || []).map((f: any) => ({ path: f.path as string, name: f.name as string }));
    const payload = { items };
    FOLDERS_CACHE.set(key, { at: now, data: payload });
    return ok(payload);
  } catch (e: any) {
    const code = e?.http_code || e?.status || 500;
    const msg = e?.error?.message || e?.message || String(e);
    if (code === 404) return ok({ items: [] });
    if (code === 420 || code === 429) return err(503, "rate_limited", { retryAfter: 60 });
    return err(500, msg);
  }
}

/** POST /api/media/folders  Body: { path } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path: string = body?.path || body?.folderPath || body?.folder;
    if (!path) return err(400, "path manquant");
    const res = await cloudinary.api.create_folder(path);
    FOLDERS_CACHE.delete(`subfolders:${parentOf(path)}`);
    return ok({ ok: true, res });
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    return err(500, msg);
  }
}

/** PATCH /api/media/folders  Body: { from: string, to: string }  (renommer/déplacer un dossier) */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const from: string = body?.from || body?.src || body?.fromPath;
    const to: string   = body?.to   || body?.dest || body?.toPath;
    if (!from || !to) return err(400, "from/to manquants");

    // 1) tente l'API native rename_folder si dispo
    const anyApi: any = (cloudinary as any).api;
    if (typeof anyApi?.rename_folder === "function") {
      await anyApi.rename_folder(from, to);
    } else {
      // 2) fallback fiable : déplacer toutes les ressources par préfixe
      await moveFolderByPrefix(from, to);
    }

    // invalider caches parents
    FOLDERS_CACHE.delete(`subfolders:${parentOf(from)}`);
    FOLDERS_CACHE.delete(`subfolders:${parentOf(to)}`);

    return ok({ ok: true, from, to });
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    return err(500, msg);
  }
}

/** DELETE /api/media/folders  Body: { path, recursive?: boolean } */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const path: string = body?.path;
    const recursive: boolean = !!body?.recursive;
    if (!path) return err(400, "path manquant");

    if (recursive) {
      for (const rt of ["image", "video", "raw"] as const) {
        try { await cloudinary.api.delete_resources_by_prefix(path, { resource_type: rt }); } catch {}
      }
      try { const sub = await cloudinary.api.sub_folders(path);
        for (const sf of sub.folders ?? []) { try { await cloudinary.api.delete_folder(sf.path); } catch {} }
      } catch {}
      try { await cloudinary.api.delete_folder(path); } catch {}
    } else {
      await cloudinary.api.delete_folder(path);
    }

    FOLDERS_CACHE.delete(`subfolders:${parentOf(path)}`);
    return ok({ ok: true, deleted: path });
  } catch (e: any) {
    const code = e?.http_code || 500;
    const msg = e?.error?.message || e?.message || String(e);
    if (code === 404) return ok({ ok: true, deleted: "already_missing" });
    return err(500, msg);
  }
}

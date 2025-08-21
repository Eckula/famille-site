// app/api/media/folders/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/app/api/_admin";

// -------- utils ----------
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

function chunk<T>(arr: T[], size = 100) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Liste tous les public_id sous un préfixe pour un resource_type donné
async function listPublicIdsByPrefix(prefix: string, resource_type: "image"|"video"|"raw") {
  const ids: string[] = [];
  let next: string | undefined = undefined;
  do {
    // @ts-ignore
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type,
      prefix,
      max_results: 500,
      next_cursor: next,
    });
    const resources = Array.isArray(res?.resources) ? res.resources : [];
    ids.push(...resources.map((r: any) => r.public_id));
    next = res?.next_cursor;
  } while (next);
  return ids;
}

// Supprime par lots les IDs pour un resource_type
async function deleteIds(resource_type: "image"|"video"|"raw", ids: string[]) {
  for (const group of chunk(ids, 100)) {
    // @ts-ignore
    await cloudinary.api.delete_resources(group, { resource_type });
  }
}

// Liste récursivement les sous-dossiers d’un path
async function listSubfolders(path: string): Promise<{ name: string; path: string }[]> {
  const out: { name: string; path: string }[] = [];
  let next: string | undefined = undefined;
  do {
    // @ts-ignore
    const res = await cloudinary.api.sub_folders(path, { max_results: 500, next_cursor: next });
    const folders = Array.isArray(res?.folders) ? res.folders : [];
    out.push(...folders.map((f: any) => ({ name: f.name, path: f.path || `${path}/${f.name}` })));
    next = res?.next_cursor;
  } while (next);
  return out;
}

// Purge récursivement un dossier : ressources (image/video/raw) + sous-dossiers
async function purgeFolderRecursive(path: string) {
  for (const rt of ["image", "video", "raw"] as const) {
    const ids = await listPublicIdsByPrefix(path, rt);
    if (ids.length) await deleteIds(rt, ids);
  }
  const subs = await listSubfolders(path);
  for (const sf of subs) {
    await purgeFolderRecursive(sf.path);
  }
  // @ts-ignore
  await cloudinary.api.delete_folder(path);
}

/** ----------------------
 * POST -> créer un dossier
 * body: { path?: string, folder?: string }
 * ---------------------- */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const body = await req.json().catch(() => ({}));
    const path = String(body?.path ?? body?.folder ?? "").trim().replace(/\/+$/, "");
    if (!path) return ok({ error: "Paramètre `path` (ou `folder`) requis." }, 400);

    try {
      // @ts-ignore
      const res = await cloudinary.api.create_folder(path);
      return ok({ ok: true, res });
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || String(e);
      if (/already exists/i.test(msg)) return ok({ ok: true, note: "Folder already exists." });
      return ok({ error: msg }, 500);
    }
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur interne" }, 500);
  }
}

/** ----------------------
 * DELETE -> supprimer dossier
 * body: { path: string, force?: boolean }
 * - force=false : supprime seulement si vide
 * - force=true  : purge toutes ressources + sous-dossiers, puis supprime
 * ---------------------- */
export async function DELETE(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const body = await req.json().catch(() => ({}));
    const path = String(body?.path ?? body?.folder ?? "").trim().replace(/\/+$/, "");
    const force = !!body?.force;
    if (!path) return ok({ error: "Paramètre `path` (ou `folder`) requis." }, 400);

    try {
      if (force) {
        await purgeFolderRecursive(path);
        return ok({ ok: true, res: { deleted: "recursive" } });
      }
      // @ts-ignore
      const res = await cloudinary.api.delete_folder(path);
      return ok({ ok: true, res });
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || String(e);
      if (/not found/i.test(msg)) return ok({ ok: true, note: "Folder not found (déjà supprimé ?)" });
      if (/is not empty|has subfolders/i.test(msg)) {
        return ok({ error: "Le dossier n’est pas vide (ou contient des sous-dossiers). Utilise force=true pour purger." }, 400);
      }
      return ok({ error: msg }, 500);
    }
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur interne" }, 500);
  }
}

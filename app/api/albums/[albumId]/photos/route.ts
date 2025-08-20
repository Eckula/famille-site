// app/api/albums/[albumId]/photos/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const bad = (msg: string, status = 400) => ok({ error: msg }, status);

// ---- Cloudinary ----
function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary non configuré (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

type Kind = "image" | "video" | "audio" | "document";
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

export async function GET(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> } // Next 15: params est un Promise
) {
  try {
    const { albumId } = await ctx.params;
    if (!albumId) return bad("albumId manquant");

    const sp = new URL(req.url).searchParams;
    const limit = Math.max(0, Number(sp.get("limit") || 0)); // 0 = pas de limite
    const tab = (sp.get("tab") || "images").toLowerCase();   // utile pour la couverture

    // 1) dossiers membres
    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      select: { folderId: true },
    });
    const folderIds = links.map((l) => l.folderId);
    if (folderIds.length === 0) return ok({ items: [] });

    // 2) publicIds de ces dossiers (appFolderId mappé vers folderId en SQL)
    const rows = await prisma.mediaIndex.findMany({
      where: { appFolderId: { in: folderIds } },
      select: { publicId: true },
    });
    const ids = Array.from(new Set(rows.map((r) => r.publicId)));
    if (ids.length === 0) return ok({ items: [] });

    // 3) Cloudinary : résolution par ids (image -> video -> raw)
    ensureCloudinary();
    const left = new Set(ids);
    const found: any[] = [];

    async function byIds(rt: "image" | "video" | "raw") {
      const batch = 100;
      const arr = Array.from(left);
      for (let i = 0; i < arr.length; i += batch) {
        const chunk = arr.slice(i, i + batch);
        if (!chunk.length) break;
        try {
          const res = await cloudinary.api.resources_by_ids(chunk, { resource_type: rt, type: "upload" } as any);
          const list = Array.isArray(res?.resources) ? res.resources : Array.isArray(res) ? res : [];
          for (const r of list) { found.push(r); left.delete(r.public_id); }
        } catch { /* on ignore ponctuellement */ }
      }
    }
    await byIds("image");
    if (left.size) await byIds("video");
    if (left.size) await byIds("raw");

    // 4) mapping + tri + filtre tab
    let items = found.map(mapItem);
    // tri décroissant par date (couvertures plus récentes en premier)
    items.sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));
    items = filterByTab(items, tab);
    if (limit > 0) items = items.slice(0, limit);

    return ok({ items });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET /api/albums/[albumId]/photos", 500);
  }
}

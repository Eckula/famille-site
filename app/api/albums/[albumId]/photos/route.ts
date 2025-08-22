// app/api/albums/[albumId]/photos/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

function ensureCloudinary() {
  const cn =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) {
    throw new Error("Cloudinary non configuré (cloud_name / api_key / api_secret).");
  }
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

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

const bad = (m: string, s = 500) => ok({ error: m }, s);

/**
 * GET /api/albums/[albumId]/photos?limit=120
 * - Dossiers membres (AlbumFolderLink)
 * - Public IDs via MediaIndex.appFolderId IN (...)
 * - Lookup Cloudinary par lots: image → video → raw
 * - Tri desc par created_at et coupe à `limit`
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await ctx.params;
    const limit = Math.max(1, Math.min(500, Number(new URL(req.url).searchParams.get("limit") || "120")));

    // 1) dossiers membres
    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      select: { folderId: true },
    });
    const folderIds = links.map((l) => l.folderId);
    if (!folderIds.length) return ok({ items: [] });

    // 2) public IDs par appFolderId
    const rows = await prisma.mediaIndex.findMany({
      where: { appFolderId: { in: folderIds } }, // ⚠️ champ mappé sur column folderId
      select: { publicId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
    });
    const ids = Array.from(new Set(rows.map((r) => r.publicId)));
    if (!ids.length) return ok({ items: [] });

    // 3) Cloudinary lookup
    ensureCloudinary();
    const left = new Set(ids);
    const found: any[] = [];

    async function byIds(rt: "image" | "video" | "raw") {
      const arr = Array.from(left);
      const chunk = 100;
      for (let i = 0; i < arr.length; i += chunk) {
        const slice = arr.slice(i, i + chunk);
        if (!slice.length) break;
        try {
          const res = await cloudinary.api.resources_by_ids(slice, {
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
            if (found.length >= limit) break;
          }
          if (found.length >= limit) break;
        } catch (e: any) {
          const msg = e?.error?.message || e?.message || String(e);
          if (/rate\s*limit/i.test(msg)) break;
        }
      }
    }

    await byIds("image");
    if (left.size && found.length < limit) await byIds("video");
    if (left.size && found.length < limit) await byIds("raw");

    const items = found
      .sort((a, b) => +new Date(b?.created_at) - +new Date(a?.created_at))
      .slice(0, limit)
      .map(mapItem);

    return ok({ items });
  } catch (e: any) {
    return bad(e?.message || "Erreur /api/albums/[albumId]/photos");
  }
}

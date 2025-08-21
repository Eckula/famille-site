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

function ok(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function bad(msg: string, status = 500) {
  return ok({ error: msg }, status);
}

/**
 * GET /api/albums/[albumId]/photos?limit=1
 * - Récupère les dossiers membres de l’album
 * - Résout les publicId dans MediaIndex (via appFolderId)
 * - Lookup Cloudinary par lots (images -> vidéos -> raw)
 * - Tri desc par createdAt et coupe à `limit`
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ albumId: string }> } // ⚠️ Next 15: params est une Promise
) {
  try {
    const { albumId } = await ctx.params; // ⚠️ attendre params
    const sp = new URL(req.url).searchParams;
    const limit = Math.max(1, Math.min(100, Number(sp.get("limit") || "30")));

    // 1) dossiers membres de l’album
    const links = await prisma.albumFolderLink.findMany({
      where: { albumId },
      select: { folderId: true }, // <-- NORMAL ici : modèle AlbumFolderLink
      // (pas d’ordre requis ici)
    });
    const folderIds = links.map((l) => l.folderId);
    if (folderIds.length === 0) return ok({ items: [] });

    // 2) on récupère les publicId dans MediaIndex via appFolderId (côté Prisma)
    //    (si ton modèle Prisma est resté avec "folderId" au lieu de "appFolderId",
    //     remplace la ligne "appFolderId" par "folderId" ci-dessous.)
    const mediaRows = await prisma.mediaIndex.findMany({
      where: { appFolderId: { in: folderIds } },
      select: { publicId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit * 3, // on prend large, on filtrera après Cloudinary
    });

    const ids = Array.from(new Set(mediaRows.map((r) => r.publicId)));
    if (ids.length === 0) return ok({ items: [] });

    // 3) Cloudinary lookup par lots (images -> vidéos -> raw)
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
          if (found.length >= limit) break;
        } catch (e: any) {
          // en cas de rate limit, on sort de ce round
          const msg = e?.error?.message || e?.message || String(e);
          if (/rate\s*limit/i.test(msg)) break;
        }
      }
    }

    await byIds("image");
    if (left.size && found.length < limit) await byIds("video");
    if (left.size && found.length < limit) await byIds("raw");

    // 4) tri par date + coupe à limit
    const items = found
      .sort(
        (a, b) =>
          +new Date(b?.created_at as string) - +new Date(a?.created_at as string)
      )
      .slice(0, limit)
      .map(mapItem);

    return ok({ items });
  } catch (e: any) {
    return bad(e?.message || "Erreur /api/albums/[albumId]/photos");
  }
}

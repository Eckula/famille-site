// app/api/events/media/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

const ok = (d: any, s = 200) => NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
const bad = (m: string, s = 400) => ok({ error: m }, s);

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

export async function GET(req: Request) {
  try {
    ensureCloudinary();
    const sp = new URL(req.url).searchParams;
    const eventId = String(sp.get("eventId") || "");
    const limit = Math.max(1, Math.min(400, Number(sp.get("limit") || "200")));
    if (!eventId) return bad("eventId requis.");

    // A) médias rangés dans le dossier de l’évènement (MediaIndex.appFolderId)
    const idx = await prisma.mediaIndex.findMany({
      where: { appFolderId: eventId },
      select: { publicId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: limit * 2,
    });
    const publicIds = Array.from(new Set(idx.map(x => x.publicId)));

    // Lookup Cloudinary par lots/type
    const found: any[] = [];
    const left = new Set(publicIds);
    async function byIds(rt: "image" | "video" | "raw") {
      const arr = Array.from(left);
      for (let i = 0; i < arr.length; i += 100) {
        const slice = arr.slice(i, i + 100);
        if (!slice.length) break;
        try {
          const res: any = await cloudinary.api.resources_by_ids(slice, { resource_type: rt, type: "upload" } as any);
          const list: any[] = Array.isArray(res?.resources) ? res.resources : (Array.isArray(res) ? res : []);
          for (const r of list) { found.push(r); left.delete(r.public_id); }
        } catch {}
      }
    }
    await byIds("image"); await byIds("video"); await byIds("raw");

    // B) médias liés par TAG "evt:<eventId>"
    const tag = `evt:${eventId}`;
    const tagged: any = await cloudinary.search
      .expression(`tags="${tag}"`)
      .with_field("context")
      .sort_by("created_at", "desc")
      .max_results(limit)
      .execute()
      .catch(() => ({ resources: [] }));
    const taggedList: any[] = Array.isArray(tagged?.resources) ? tagged.resources : [];

    // Union (évite les doublons)
    const byId: Record<string, any> = {};
    for (const r of [...found, ...taggedList]) byId[r.public_id] = r;

    const items = Object.values(byId)
      .sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))
      .slice(0, limit)
      .map(mapItem);

    return ok({ items, count: items.length, eventId });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET /api/events/media", 500);
  }
}

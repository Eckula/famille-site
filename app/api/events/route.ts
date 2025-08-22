// app/api/events/tag/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/app/api/_admin";

const ok = (d: any, s = 200) => NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
const bad = (m: string, s = 400) => ok({ error: m }, s);

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary non configuré (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

type Body = {
  eventId: string;
  public_ids: string[];
  action?: "add" | "remove";
};

async function tagAll(rt: "image" | "video" | "raw", action: "add" | "remove", tag: string, ids: string[]) {
  if (!ids.length) return;
  const fn = action === "add" ? cloudinary.uploader.add_tag : cloudinary.uploader.remove_tag;
  // @ts-ignore
  await fn(tag, ids, { resource_type: rt, type: "upload" });
}

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const b: Body = await req.json().catch(() => ({} as any));
    const eventId = String(b?.eventId || "").trim();
    const action = (b?.action || "add") as "add" | "remove";
    const ids = Array.isArray(b?.public_ids) ? b.public_ids.map(String).filter(Boolean) : [];
    if (!eventId || !ids.length) return bad("eventId et public_ids requis.");

    const tag = `evt:${eventId}`;
    await tagAll("image", action, tag, ids).catch(() => {});
    await tagAll("video", action, tag, ids).catch(() => {});
    await tagAll("raw",   action, tag, ids).catch(() => {});

    return ok({ ok: true, action, count: ids.length, tag });
  } catch (e: any) {
    return bad(e?.message || "Erreur tag event.");
  }
}

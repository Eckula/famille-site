// app/api/albums/[albumId]/cover/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/app/api/_admin";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function tagFor(albumId: string) {
  return `album_cover_${albumId}`; // pas de ":" pour rester safe
}

function ensureCloudinary() {
  const cloud_name =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary non configuré (CLOUD_NAME/API_KEY/API_SECRET).");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

/** GET /api/albums/[albumId]/cover?size=card */
export async function GET(_req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  try {
    const { albumId } = await ctx.params;
    ensureCloudinary();
    const tag = tagFor(albumId);

    const res = await cloudinary.search
      .expression(`tags="${tag}"`)
      .max_results(1)
      .sort_by("created_at", "desc")
      .execute()
      .catch(() => null);

    const publicId = res?.resources?.[0]?.public_id || null;
    if (!publicId) return ok({ coverUrl: null, publicId: null });

    const url = cloudinary.url(publicId, {
      resource_type: "image", // on force image pour la cover
      transformation: [
        { width: 800, height: 450, crop: "fill", gravity: "auto" },
        { fetch_format: "auto", quality: "auto" },
      ],
      sign_url: false,
      secure: true,
    });

    return ok({ coverUrl: url, publicId });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur GET cover" }, 400);
  }
}

/** POST /api/albums/[albumId]/cover   { publicId } */
export async function POST(req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    const { publicId } = await req.json().catch(() => ({}));
    if (!publicId) return ok({ error: "publicId requis" }, 400);

    ensureCloudinary();
    const tag = tagFor(albumId);

    // 1) Retire le tag des éventuelles anciennes covers
    const old = await cloudinary.search
      .expression(`tags="${tag}"`)
      .max_results(100)
      .execute()
      .catch(() => null);
    const olds: string[] = Array.isArray(old?.resources)
      ? old.resources.map((r: any) => r.public_id)
      : [];
    if (olds.length) {
      await cloudinary.uploader.remove_tag(tag, olds);
    }

    // 2) Ajoute le tag au publicId choisi
    await cloudinary.uploader.add_tag(tag, [publicId]);

    return ok({ ok: true, albumId, publicId });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur POST cover" }, 400);
  }
}

/** DELETE /api/albums/[albumId]/cover  */
export async function DELETE(req: Request, ctx: { params: Promise<{ albumId: string }> }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { albumId } = await ctx.params;
    ensureCloudinary();
    const tag = tagFor(albumId);

    const res = await cloudinary.search
      .expression(`tags="${tag}"`)
      .max_results(100)
      .execute()
      .catch(() => null);
    const pubIds: string[] = Array.isArray(res?.resources)
      ? res.resources.map((r: any) => r.public_id)
      : [];
    if (pubIds.length) {
      await cloudinary.uploader.remove_tag(tag, pubIds);
    }
    return ok({ ok: true, albumId, removed: pubIds.length });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur DELETE cover" }, 400);
  }
}

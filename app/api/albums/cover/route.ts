// app/api/albums/cover/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/app/api/_admin";

// ---------- Helpers ----------
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
function ok(data: any, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
function bad(err: string, status = 400) {
  return ok({ error: err }, status);
}
function coverTag(albumId: string) {
  return `album_cover:${albumId}`;
}
function coverUrl(publicId: string) {
  // URL optimisée (16:9), secure, pas de signature
  return cloudinary.url(publicId, {
    transformation: [
      { width: 800, height: 450, crop: "fill", gravity: "auto" },
      { fetch_format: "auto", quality: "auto" },
    ],
    secure: true,
    sign_url: false,
    resource_type: "image",
  });
}

// ---------- GET /api/albums/cover?albumId=... ----------
// Retourne { public_id, url } si une image porte le tag album_cover:<albumId>; sinon { public_id: null, url: null }
export async function GET(req: Request) {
  try {
    ensureCloudinary();
    const sp = new URL(req.url).searchParams;
    const albumId = String(sp.get("albumId") || "").trim();
    if (!albumId) return bad("albumId requis", 400);

    const tag = coverTag(albumId);
    const res = await cloudinary.search
      .expression(`resource_type:image AND tags=${tag}`)
      .sort_by("created_at", "desc")
      .max_results(1)
      .execute()
      .catch(() => null);

    const public_id: string | null = res?.resources?.[0]?.public_id ?? null;
    const url = public_id ? coverUrl(public_id) : null;
    return ok({ public_id, url });
  } catch (e: any) {
    return bad(e?.message || "Erreur GET cover", 500);
  }
}

// ---------- POST /api/albums/cover ----------
// Body: { albumId, publicId } → supprime l'ancien tag sur d'éventuelles autres images, puis ajoute le tag à publicId
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const body = await req.json().catch(() => ({}));
    const albumId = String(body.albumId || "").trim();
    const publicId = String(body.publicId || "").trim();
    if (!albumId || !publicId) return bad("albumId et publicId requis", 400);

    const tag = coverTag(albumId);

    // 1) Retirer le tag des images qui l'ont déjà
    const prev = await cloudinary.search
      .expression(`resource_type:image AND tags=${tag}`)
      .max_results(100)
      .execute()
      .catch(() => ({ resources: [] as any[] }));
    const toClear: string[] = (prev?.resources || []).map((r: any) => r.public_id);
    if (toClear.length) {
      await cloudinary.uploader.remove_tag(tag, toClear).catch(() => {});
    }

    // 2) Ajouter le tag à la nouvelle image (publicId)
    await cloudinary.uploader.add_tag(tag, [publicId]).catch((e) => {
      throw new Error(e?.message || "Impossible d’ajouter le tag de couverture");
    });

    const url = coverUrl(publicId);
    return ok({ ok: true, public_id: publicId, url });
  } catch (e: any) {
    return bad(e?.message || "Erreur POST cover", 400);
  }
}

// ---------- DELETE /api/albums/cover ----------
// Body: { albumId } → supprime le tag album_cover:<albumId> de toutes les images
export async function DELETE(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const body = await req.json().catch(() => ({}));
    const albumId = String(body.albumId || "").trim();
    if (!albumId) return bad("albumId requis", 400);

    const tag = coverTag(albumId);
    const prev = await cloudinary.search
      .expression(`resource_type:image AND tags=${tag}`)
      .max_results(100)
      .execute()
      .catch(() => ({ resources: [] as any[] }));
    const toClear: string[] = (prev?.resources || []).map((r: any) => r.public_id);
    if (toClear.length) {
      await cloudinary.uploader.remove_tag(tag, toClear).catch(() => {});
    }
    return ok({ ok: true, removed: toClear.length });
  } catch (e: any) {
    return bad(e?.message || "Erreur DELETE cover", 400);
  }
}

// app/api/media/sync-latest/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin";

const ROOT =
  (process.env.CLOUDINARY_ROOT_FOLDER ||
    process.env.CLD_ROOT ||
    "famille").trim();

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });
const bad = (m: string, s = 500) => ok({ error: m }, s);

function ensureCloudinary() {
  const cn =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) {
    throw new Error(
      "Cloudinary non configuré (cloud_name / api_key / api_secret manquants)."
    );
  }
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

function hasAdminKey(req: Request) {
  const want = (process.env.ADMIN_API_KEY || "").trim();
  if (!want) return false;
  const fromHeader = (req.headers.get("x-admin-key") || "").trim();
  const fromQuery = (new URL(req.url).searchParams.get("key") || "").trim();
  return !!want && (fromHeader === want || fromQuery === want);
}

async function searchLatest(resourceType: "image" | "video" | "raw", max = 500) {
  // Cloudinary Search, tri desc par date d’upload
  const s = cloudinary.search
    .expression(`folder:${ROOT}/*`)
    .with_field("context")
    .with_field("tags")
    .max_results(Math.min(500, Math.max(1, max)))
    .sort_by("uploaded_at", "desc");

  // @ts-ignore
  if (resourceType !== "image") s.resource_type(resourceType);
  // @ts-ignore
  const r = await s.execute();
  return Array.isArray(r?.resources) ? r.resources : [];
}

/**
 * GET /api/media/sync-latest?perPage=500
 * Auth : admin ou x-admin-key / ?key
 * Effet : upsert des derniers assets dans MediaIndex (folder=null)
 */
export async function GET(req: Request) {
  if (!hasAdminKey(req)) {
    const deny = await requireAdmin(req);
    if (deny) return deny;
  }

  try {
    ensureCloudinary();
    const per = parseInt(new URL(req.url).searchParams.get("perPage") || "500", 10) || 500;

    const [img, vid, raw] = await Promise.all([
      searchLatest("image", per),
      searchLatest("video", per),
      searchLatest("raw", Math.min(per, 200)),
    ]);

    const all = [...img, ...vid, ...raw];
    let upserts = 0;

    for (const a of all) {
      const publicId = String(a.public_id || "");
      if (!publicId) continue;

      await prisma.mediaIndex.upsert({
        where: { publicId },
        update: {},                        // ne modifie pas un mapping existant
        create: { publicId, appFolderId: null }, // → “Mes fichiers”
      });
      upserts++;
    }

    return ok({ ok: true, root: ROOT, scanned: all.length, upserts });
  } catch (e: any) {
    return bad(e?.message || "sync-latest failed");
  } finally {
    await prisma.$disconnect();
  }
}

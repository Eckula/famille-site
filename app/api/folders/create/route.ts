// app/api/folders/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";               // ← singleton (recommandé)
import { requireAdmin } from "@/app/api/_admin";

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

/**
 * Body:
 * { parentName: "Albums" | "Evenements", name: "Mon album" }
 * -> crée le dossier Cloudinary `${ROOT}/${parentName}/${name}`
 * -> assure la présence côté Prisma (parent + enfant dans AppFolder)
 */
export async function POST(req: NextRequest) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { parentName, name } = await req.json();
    const parent = String(parentName || "").trim();
    const child  = String(name || "").trim();
    if (!parent || !child) return ok({ error: "parentName et name requis." }, 400);

    ensureCloudinary();

    // 1) Cloudinary (idempotent)
    const clPath = `${ROOT}/${parent}/${child}`;
    try {
      // @ts-ignore
      await cloudinary.api.create_folder(clPath);
    } catch (e: any) {
      const msg = e?.error?.message || e?.message || "";
      if (!/already exists/i.test(msg)) throw e;
    }

    // 2) Prisma (modèle AppFolder)
    let p = await prisma.appFolder.findFirst({ where: { name: parent, parentId: null } });
    if (!p) p = await prisma.appFolder.create({ data: { name: parent, parentId: null } });

    let c = await prisma.appFolder.findFirst({ where: { name: child, parentId: p.id } });
    if (!c) c = await prisma.appFolder.create({ data: { name: child, parentId: p.id } });

    return ok({ ok: true, item: { id: c.id, name: c.name, parentId: c.parentId }, cloudinaryPath: clPath });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur création dossier." }, 500);
  }
}

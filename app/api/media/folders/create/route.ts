// app/api/media/folders/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "../../../_admin"; // <- 3 niveaux (media/folders/create -> api/_admin)

// (optionnel) création côté Cloudinary si demandé par le client
import { v2 as cloudinary } from "cloudinary";

const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary non configuré (cloud_name/api_key/api_secret manquants).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/media/folders/create
 * body: {
 *   name: string,
 *   parentId?: string | null,
 *   cloudParent?: string,         // ex: "Galerie" ou "Albums" (facultatif)
 *   createOnCloud?: boolean       // true => tente aussi de créer le dossier Cloudinary
 * }
 *
 * - Si parentId === null : findFirst + create (car upsert composite ne supporte pas null)
 * - Sinon : upsert via @@unique([parentId, name])
 * - (optionnel) crée le dossier Cloudinary: `${ROOT}/${cloudParent || 'Galerie'}/${name}`
 */
export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    const parentId: string | null =
      typeof body?.parentId === "string" && body.parentId.trim()
        ? body.parentId.trim()
        : null;

    const createOnCloud = Boolean(body?.createOnCloud || false);
    const cloudParent = String(body?.cloudParent || "").trim() || "Galerie";

    if (!name) return ok({ error: "Paramètre `name` requis." }, 400);

    // 1) Prisma
    let folder;
    if (parentId === null) {
      // pas d'upsert composite quand une partie de la clé est null
      folder = await prisma.appFolder.findFirst({ where: { name, parentId: null } });
      if (!folder) {
        folder = await prisma.appFolder.create({ data: { name, parentId: null } });
      }
    } else {
      folder = await prisma.appFolder.upsert({
        where: { parentId_name: { parentId, name } },
        update: {},
        create: { name, parentId },
      });
    }

    // 2) Cloudinary (facultatif)
    let cloudinaryPath: string | null = null;
    if (createOnCloud) {
      try {
        ensureCloudinary();
        cloudinaryPath = `${ROOT}/${cloudParent}/${name}`;
        // @ts-ignore (create_folder existe bien côté Cloudinary)
        await cloudinary.api.create_folder(cloudinaryPath).catch((e: any) => {
          const msg = e?.error?.message || e?.message || "";
          if (!/already exists/i.test(msg)) throw e;
        });
      } catch (e: any) {
        // on n'échoue pas la route pour un souci Cloudinary : on remonte l’info
        return ok({
          ok: true,
          item: { id: folder.id, name: folder.name, parentId: folder.parentId },
          cloudinary: { tried: true, ok: false, error: e?.message || String(e) },
        });
      }
    }

    return ok({
      ok: true,
      item: { id: folder.id, name: folder.name, parentId: folder.parentId },
      cloudinary: { tried: createOnCloud, ok: !!cloudinaryPath, path: cloudinaryPath },
    });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur création dossier." }, 500);
  }
}

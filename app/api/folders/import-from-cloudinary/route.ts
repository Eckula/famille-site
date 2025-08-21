// app/api/folders/import-from-cloudinary/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../../_admin";

/**
 * Cette route importe/synchronise les dossiers Cloudinary vers la table AppFolder :
 * - Racine Cloudinary = CLOUDINARY_ROOT_FOLDER (ou CLD_ROOT) (défaut: "famille")
 * - Deux sections gérées : "Albums" et "Evenements" (1 niveau d'enfants)
 *
 * On évite les upsert composites avec parentId=null, car Prisma n'aime pas ça.
 * On fait donc: findFirst -> create si introuvable.
 */

const ROOT =
  (process.env.CLOUDINARY_ROOT_FOLDER ||
    process.env.CLD_ROOT ||
    "famille").trim();

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const bad = (msg: string, status = 500) => ok({ error: msg }, status);

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

// Lit les sous-dossiers Cloudinary d’un chemin, renvoie [] si non trouvé
async function listSubfolders(path: string): Promise<Array<{ name: string; path: string }>> {
  try {
    // @ts-ignore types partiels côté cloudinary
    const r = await cloudinary.api.subfolders(path);
    return Array.isArray(r?.folders) ? r.folders : [];
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || "";
    // si le dossier n'existe pas côté cloudinary, on renvoie simplement []
    if (/does not exist|not found|cannot find/i.test(msg)) return [];
    throw e;
  }
}

// Assure la présence d’un dossier racine (Albums / Evenements) côté Prisma
async function ensureRootInPrisma(rootName: string) {
  let row = await prisma.appFolder.findFirst({
    where: { name: rootName, parentId: null },
  });
  if (!row) {
    row = await prisma.appFolder.create({
      data: { name: rootName, parentId: null },
    });
  }
  return row;
}

// Assure la présence d’un *enfant* (un niveau) côté Prisma
async function ensureChildInPrisma(parentId: string, childName: string) {
  let row = await prisma.appFolder.findFirst({
    where: { name: childName, parentId },
  });
  if (!row) {
    row = await prisma.appFolder.create({
      data: { name: childName, parentId },
    });
  }
  return row;
}

// Assure la présence d’un dossier Cloudinary (idempotent)
async function ensureFolderInCloudinary(path: string) {
  try {
    // @ts-ignore
    await cloudinary.api.create_folder(path);
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || "";
    if (!/already exists/i.test(msg)) throw e;
  }
}

/**
 * GET /api/folders/import-from-cloudinary
 * Optionnel: ?sections=Albums,Evenements (par défaut: les deux)
 */
export async function GET(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();

    const url = new URL(req.url);
    const sectionsParam = (url.searchParams.get("sections") || "").trim();
    const sections =
      sectionsParam
        ? sectionsParam.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Albums", "Evenements"];

    const summary: Record<
      string,
      { createdCloudinary: number; ensuredRoot: string; createdChildren: number; children: string[] }
    > = {};

    for (const section of sections) {
      // 1) Assurer le dossier racine Cloudinary (ROOT/Section)
      const clRootPath = `${ROOT}/${section}`;
      await ensureFolderInCloudinary(clRootPath);

      // 2) Assurer le dossier racine Prisma
      const rootRow = await ensureRootInPrisma(section);

      // 3) Lister les sous-dossiers Cloudinary (un niveau)
      const clChildren = await listSubfolders(clRootPath);

      let createdChildren = 0;
      const names: string[] = [];

      // 4) Pour chaque sous-dossier Cloudinary, assurer la présence dans Prisma
      for (const f of clChildren) {
        const childName = f.name;
        names.push(childName);
        const before = await prisma.appFolder.findFirst({
          where: { name: childName, parentId: rootRow.id },
        });
        if (!before) {
          await prisma.appFolder.create({
            data: { name: childName, parentId: rootRow.id },
          });
          createdChildren++;
        }
      }

      summary[section] = {
        createdCloudinary: 0, // on crée juste la racine si absente, les sous-dossiers viennent de Cloudinary
        ensuredRoot: rootRow.id,
        createdChildren,
        children: names,
      };
    }

    return ok({
      ok: true,
      root: ROOT,
      sections,
      summary,
      ts: Date.now(),
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return bad(`Erreur import-from-cloudinary: ${msg}`);
  }
}

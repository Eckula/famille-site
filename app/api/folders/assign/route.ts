// app/api/folders/assign/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/app/api/_admin"; // peut renvoyer NextResponse | null

type Body = {
  folderId?: string | null;
  public_ids?: string[];
  publicIds?: string[];
  ids?: string[];
};

const json = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function cleanIds(input: unknown): string[] {
  const arr = Array.isArray(input) ? input : [];
  return Array.from(
    new Set(
      arr
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter((s) => s.length > 0)
    )
  );
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json().catch(() => ({}))) as Body;
  } catch {}

  // Accepte plusieurs alias pour la liste
  const publicIds = cleanIds(body.public_ids ?? body.publicIds ?? body.ids);
  if (publicIds.length === 0) {
    return json({ error: "Aucun public_id fourni." }, 400);
  }

  // folderId peut être "", null, undefined => non affecté
  const raw = body.folderId;
  const targetFolderId =
    raw === undefined || raw === null || String(raw).trim() === "" ? null : String(raw);

  // ⚠️ On ne demande l'admin QUE si on affecte à un dossier non null
  if (targetFolderId !== null) {
    const deny = await requireAdmin?.(req);
    if (deny) return deny;
  }

  try {
    if (targetFolderId === null) {
      // Non affecté (view=unassigned) : on upsert appFolderId = null
      await prisma.$transaction(
        publicIds.map((publicId) =>
          prisma.mediaIndex.upsert({
            where: { publicId },
            update: { appFolderId: null },
            create: { publicId, appFolderId: null },
          })
        )
      );
      return json({ ok: true, action: "unassign", count: publicIds.length });
    }

    // Contrôle d'existence du dossier cible
    const folder = await prisma.appFolder.findUnique({
      where: { id: targetFolderId },
      select: { id: true, name: true },
    });
    if (!folder) {
      return json({ error: `Folder introuvable: ${targetFolderId}` }, 404);
    }

    // Affectation au dossier
    await prisma.$transaction(
      publicIds.map((publicId) =>
        prisma.mediaIndex.upsert({
          where: { publicId },
          update: { appFolderId: targetFolderId },
          create: { publicId, appFolderId: targetFolderId },
        })
      )
    );

    return json({
      ok: true,
      action: "assign",
      count: publicIds.length,
      appFolderId: targetFolderId,
      folderName: folder.name,
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (/Unique constraint/i.test(msg))
      return json({ error: "Contrainte unique manquante sur MediaIndex.publicId." }, 400);
    if (/Foreign key/i.test(msg))
      return json({ error: "folderId inconnu en base (FK)." }, 400);
    return json({ error: msg }, 500);
  }
}

// (Pas d'autres verbes)
export async function GET() {
  return json({ error: "Method Not Allowed" }, 405);
}
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;

// app/api/media/folders/create/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "../../_admin";

const ok = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body?.name || "").trim();
    // parentId peut être string ou null (racine)
    const parentId: string | null =
      typeof body?.parentId === "string" && body.parentId.trim()
        ? body.parentId.trim()
        : null;

    if (!name) return ok({ error: "name requis." }, 400);

    let folder;

    if (parentId === null) {
      // 🚫 Pas d'upsert composite quand parentId est NULL
      folder = await prisma.appFolder.findFirst({
        where: { name, parentId: null },
      });
      if (!folder) {
        folder = await prisma.appFolder.create({
          data: { name, parentId: null },
        });
      }
    } else {
      // ✅ parentId défini → on peut utiliser la clé composite @@unique([parentId, name])
      folder = await prisma.appFolder.upsert({
        where: { parentId_name: { parentId, name } },
        update: {},
        create: { name, parentId },
      });
    }

    return ok({
      ok: true,
      item: { id: folder.id, name: folder.name, parentId: folder.parentId },
    });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur création dossier." }, 500);
  }
}

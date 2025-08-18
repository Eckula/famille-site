// app/api/folders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../_admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Renommer un dossier (admin-only) */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  const id = params?.id;
  if (!id) return ok({ error: "ID manquant." }, 400);

  try {
    const body = await req.json().catch(() => ({}));
    const newName = String(body?.name || "").trim();
    if (!newName) return ok({ error: "Nom requis." }, 400);

    const item = await prisma.folder.update({
      where: { id },
      data: { name: newName },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item });
  } catch (e: any) {
    // Erreurs Prisma courantes
    if (e?.code === "P2002") return ok({ error: "Un dossier porte déjà ce nom." }, 409);
    if (e?.code === "P2025") return ok({ error: "Dossier introuvable." }, 404);
    return ok({ error: e?.message || "Erreur de renommage." }, 400);
  }
}

/** Supprimer un dossier (admin-only) */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  const id = params?.id;
  if (!id) return ok({ error: "ID manquant." }, 400);

  try {
    await prisma.folder.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur suppression dossier." }, 400);
  }
}

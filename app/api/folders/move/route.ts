// app/api/folders/move/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaPayload = {
  public_id: string;
  resource_type?: "image" | "video" | "raw";
  format?: string;
  title?: string;
  createdAt?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const folderId: string | undefined = body?.folderId;
    const media: MediaPayload[] = Array.isArray(body?.media) ? body.media : [];

    if (!folderId || !media.length) {
      return NextResponse.json(
        { error: "folderId et media[] requis" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      select: { id: true },
    });
    if (!folder) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
    }

    const moved = [];
    for (const m of media) {
      if (!m.public_id) continue;

      // On met à jour si déjà indexé, sinon on crée
      const existing = await prisma.mediaIndex.findFirst({
        where: { publicId: m.public_id },
        select: { id: true },
      });

      const data = {
        folderId,
        publicId: m.public_id,
        resourceType: (m.resource_type || "image") as "image" | "video" | "raw",
        format: m.format || null,
        title: m.title || null,
        // si tu as un champ createdAt dans MediaIndex
        ...(m.createdAt ? { createdAt: new Date(m.createdAt) } : {}),
      };

      if (existing) {
        moved.push(
          await prisma.mediaIndex.update({
            where: { id: existing.id },
            data,
          })
        );
      } else {
        moved.push(await prisma.mediaIndex.create({ data }));
      }
    }

    return NextResponse.json({ ok: true, moved: moved.length });
  } catch (e: any) {
    console.error("[/api/folders/move] error:", e?.message || e);
    return NextResponse.json(
      { error: "Erreur interne (move)" },
      { status: 500 }
    );
  }
}

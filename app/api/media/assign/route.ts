// app/api/media/assign/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Body =
  | { action: "assign"; folderId: string; publicIds: string[] }
  | { action: "unassign"; publicIds: string[] };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.action) {
      return NextResponse.json({ error: "action requise" }, { status: 400 });
    }

    let folderId: string | null = null;
    if (body.action === "assign") {
      if (!body.appFoldeId) return NextResponse.json({ error: "folderId requis" }, { status: 400 });
      // make sure folder exists
      const f = await prisma.appFolder.findUnique({ where: { id: body.folderId }, select: { id: true } });
      if (!f) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
      folderId = f.id;
    }

    const ids = Array.from(new Set(body.publicIds || [])).filter(Boolean);
    if (!ids.length) return NextResponse.json({ error: "Aucun publicId" }, { status: 400 });

    await prisma.$transaction(
      ids.map((publicId) =>
        prisma.mediaIndex.upsert({
          where: { publicId },
          update: { folderId },
          create: { publicId, folderId },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur /api/media/assign" }, { status: 500 });
  }
}

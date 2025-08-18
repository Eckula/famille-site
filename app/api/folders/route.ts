// app/api/folders/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../_admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const prisma = new PrismaClient();
const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  try {
    const items = await prisma.folder.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ items });
  } catch (e: any) {
    return ok({ items: [], error: e?.message || "Erreur" }, 500);
  }
}

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    const { name, parentId } = await req.json();
    const n = String(name || "").trim();
    if (!n) return ok({ error: "Nom du dossier requis." }, 400);

    const item = await prisma.folder.create({
      data: { name: n, parentId: parentId ?? null },
      select: { id: true, name: true, parentId: true, createdAt: true },
    });
    return ok({ item });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur création dossier." }, 400);
  }
}

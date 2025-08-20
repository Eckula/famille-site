// app/api/folders/rename/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireAdmin } from "../../_admin";

const prisma = new PrismaClient();
const ok = (d:any,s=200)=>NextResponse.json(d,{status:s,headers:{'Cache-Control':'no-store'}});

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;
  try {
    const { id, name } = await req.json();
    if (!id || !name) return ok({ error: "id et name requis" }, 400);
    const row = await prisma.folder.update({ where: { id: String(id) }, data: { name: String(name) } });
    return ok({ ok: true, item: row });
  } catch (e:any) {
    return ok({ error: e?.message || "Erreur" }, 500);
  }
}

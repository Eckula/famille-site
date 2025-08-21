// app/api/folders/import-from-cloudinary/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes.");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

async function listAllFolders(root: string) {
  const out: string[] = [];
  // liste les sous-dossiers immédiats du root
  // @ts-ignore
  const top = await cloudinary.api.sub_folders(root);
  const stack: string[] = (top?.folders || []).map((f: any) => f.path);

  out.push(root);
  while (stack.length) {
    const p = stack.pop()!;
    out.push(p);
    try {
      // @ts-ignore
      const res = await cloudinary.api.sub_folders(p);
      for (const f of res?.folders || []) stack.push(f.path);
    } catch {}
  }
  // on enlève le root de la liste retournée (DB ne stocke que les noms “visibles”)
  return out.filter((p) => p !== root);
}

export async function GET() {
  try {
    ensureCloudinary();
    const folders = await listAllFolders(ROOT);

    // Upsert en DB (on ne stocke que le dernier segment en "name")
    // parentId: null (simple) — tu peux améliorer si tu veux la hiérarchie complète.
    let created = 0;
    for (const full of folders) {
      const name = full.split("/").pop()!;
      await prisma.appFolder.upsert({
        where: { parentId_name: { parentId: null, name } },
        update: {},
        create: { name, parentId: null },
      });
      created++;
    }
    return NextResponse.json({ ok: true, created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

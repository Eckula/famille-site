export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⚙️ Retourne les sous-dossiers directs d’un dossier parent (ex: "famille/Albums")
export async function POST(req: Request) {
  try {
    const { parent } = await req.json();
    if (!parent || typeof parent !== "string") {
      return NextResponse.json({ error: "Paramètre `parent` manquant." }, { status: 400 });
    }

    // API admin Cloudinary pour lister les sous-dossiers
    // @ts-ignore types incomplets côté Cloudinary
    const r = await cloudinary.api.sub_folders(parent);

    // r.folders = [{ name: 'Paul', path: 'famille/Albums/Paul' }, ...]
    return NextResponse.json({ ok: true, folders: r?.folders ?? [] });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

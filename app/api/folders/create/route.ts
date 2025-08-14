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

export async function POST(req: Request) {
  try {
    const { folder } = await req.json();
    if (!folder || typeof folder !== "string") {
      return NextResponse.json({ error: "Paramètre `folder` manquant." }, { status: 400 });
    }
    // crée le dossier (idempotent)
    // @ts-ignore
    const r = await cloudinary.api.create_folder(folder);
    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    // Si existe déjà, Cloudinary renvoie une erreur — on peut considérer ok
    const msg = e?.message || String(e);
    if (msg.includes("already exists")) {
      return NextResponse.json({ ok: true, note: "Folder already exists." });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

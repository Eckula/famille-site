export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { path } = await req.json(); // ex: "famille/Evenements/Anniversaire-Paul_2025-08-15"
    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path manquant" }, { status: 400 });
    }

    // Cloudinary a une API dédiée:
    const res = await cloudinary.api.create_folder(path);
    return NextResponse.json({ ok: true, res });
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

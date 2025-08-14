// app/api/media/folder/create/route.ts
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
    const { path } = await req.json(); // ex: "famille/Albums/Ethan-Joy"
    if (!path) return NextResponse.json({ error: "path manquant" }, { status: 400 });
    const r = await cloudinary.api.create_folder(path);
    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

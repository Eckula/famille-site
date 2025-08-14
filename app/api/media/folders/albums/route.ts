// app/api/media/folders/albums/route.ts
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

const ROOT = "famille/Albums";

export async function GET() {
  try {
    let folders: any[] = [];
    try {
      const r = await cloudinary.api.sub_folders(ROOT);
      folders = r.folders ?? [];
    } catch (e:any) {
      // s'il n'existe pas encore, on renvoie vide
      if (!/Cannot find folder/i.test(e?.message || "")) throw e;
    }
    return NextResponse.json({ folders: folders.map(f => ({ name: f.name, path: f.path })) });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

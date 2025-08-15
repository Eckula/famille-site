// app/api/media/migrate-pdf/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs"; // exécution Node sur Vercel

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { public_id, url } = await req.json();
    if (!public_id || !url) {
      return NextResponse.json({ error: "public_id et url requis" }, { status: 400 });
    }

    // Ré-upload distant vers RAW avec le même public_id
    const up = await cloudinary.uploader.upload(url, {
      resource_type: "raw",
      public_id,
      overwrite: true,
      invalidate: true,
    });

    // Supprimer l’ancienne ressource image (silencieux si inexistante)
    try {
      await cloudinary.api.delete_resources([public_id], { resource_type: "image" });
    } catch {}

    return NextResponse.json({ ok: true, up });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "migration failed" }, { status: 500 });
  }
}

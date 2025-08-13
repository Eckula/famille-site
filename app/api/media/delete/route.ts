// app/api/media/delete/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// essaie sur image, vidéo puis raw
async function destroyAny(publicId: string) {
  const tryType = async (type: "image" | "video" | "raw") => {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: type as any });
    return res.result === "ok" || res.result === "not found";
  };
  if (await tryType("image")) return true;
  if (await tryType("video")) return true;
  if (await tryType("raw"))   return true;
  return false;
}

export async function POST(req: Request) {
  try {
    const { public_id } = await req.json();
    if (!public_id) return NextResponse.json({ error: "public_id requis" }, { status: 400 });

    const ok = await destroyAny(public_id);
    if (!ok) return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}

// app/api/media/signed-raw-url/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { public_id, format = "pdf" } = await req.json();

    if (!public_id) {
      return NextResponse.json({ error: "public_id requis" }, { status: 400 });
    }

    const expires_at = Math.floor(Date.now() / 1000) + 60 * 60; // 1h
    // URL signée pour ressources RAW possiblement 'authenticated'
    const url = cloudinary.utils.private_download_url(public_id, format, {
      resource_type: "raw",
      type: "authenticated",
      expires_at,
      attachment: false, // inline
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "signed url failed" }, { status: 500 });
  }
}

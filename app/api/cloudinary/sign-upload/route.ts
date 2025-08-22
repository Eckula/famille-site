// app/api/cloudinary/sign-upload/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

/**
 * POST /api/cloudinary/sign-upload
 * Body: { folder?: string, size?: number }
 *
 * -> Renvoie les paramètres signés pour un upload direct côté client.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = (body?.folder || "").toString().trim();
    const size = Number(body?.size || 0);

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary non configuré (cloud_name, api_key, api_secret)" },
        { status: 500 }
      );
    }

    const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 100);
    if (size > maxMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (> ${maxMb} Mo)` },
        { status: 400 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign: Record<string, any> = {
      timestamp,
      folder,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
    const signature = cloudinary.utils.api_sign_request(toSign, apiSecret);

    return NextResponse.json({
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      signature,
      folder,
      overwrite: true,
    });
  } catch (e: any) {
    const msg = e?.message || "Erreur signature";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Méthodes non supportées
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405, headers: { Allow: "POST" } });
}
export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405, headers: { Allow: "POST" } });
}
export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405, headers: { Allow: "POST" } });
}

// app/api/cloudinary/sign-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 100);
const ROOT = process.env.CLOUDINARY_ROOT_FOLDER || "famille";

// Génère la signature pour upload direct navigateur -> Cloudinary.
// ⚠️ On NE SIGNE PAS `public_id`. On laisse Cloudinary dériver depuis le nom de fichier.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { folder, size, overwrite } = body || {};

    if (typeof size === "number" && size > MAX_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (> ${MAX_MB} Mo)` },
        { status: 413 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign: Record<string, any> = {
      timestamp,
      folder: (folder || ROOT).replace(/\/+/g, "/"),
      use_filename: true,     // ← garder le nom d’origine
      unique_filename: false, // ← pas de suffixe aléatoire
    };
    if (typeof overwrite === "boolean") toSign.overwrite = overwrite;

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({
      ok: true,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder: toSign.folder,
      signature,
      use_filename: true,
      unique_filename: false,
      overwrite: typeof overwrite === "boolean" ? overwrite : undefined,
      max_mb: MAX_MB,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur signature" },
      { status: 500 }
    );
  }
}

// app/api/cloudinary/sign-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 100);
const ROOT = process.env.CLOUDINARY_ROOT_FOLDER || "famille";
const OVERWRITE =
  (process.env.CLOUDINARY_OVERWRITE_ON_UPLOAD || "false").toLowerCase() === "true";

// Nettoie un chemin de dossier (letters/digits/_-. et sous-dossiers)
function cleanFolderPath(p: string) {
  return (p || "")
    .split("/")
    .map((s) => s.trim().replace(/[^A-Za-z0-9._-]+/g, "-"))
    .filter(Boolean)
    .join("/");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      folder,          // ex: "famille/Photos/Anniv-2025"
      tags,
      context,         // ex: { caption: "...", alt: "..." }
      size,            // nombre (octets) envoyé par le client (recheck)
    } = body || {};

    if (typeof size === "number" && size > MAX_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (> ${MAX_MB} Mo)` },
        { status: 413 }
      );
    }

    // Dossier final
    const finalFolder = cleanFolderPath(folder || ROOT) || ROOT;

    const timestamp = Math.floor(Date.now() / 1000);

    // On SIGNE TOUT ce qui doit être pris en compte côté upload
    // et on NE met PAS de public_id → Cloudinary gardera le nom d’origine
    const toSign: Record<string, any> = {
      timestamp,
      folder: finalFolder,
      use_filename: true,
      unique_filename: false,
      overwrite: OVERWRITE,
    };

    if (tags) toSign.tags = Array.isArray(tags) ? tags.join(",") : String(tags);
    if (context && typeof context === "object") {
      const ctx = Object.entries(context)
        .map(([k, v]) => `${k}=${String(v)}`)
        .join("|");
      toSign.context = ctx;
    }

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({
      ok: true,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      signature,
      timestamp,
      folder: finalFolder,
      use_filename: true,
      unique_filename: false,
      overwrite: OVERWRITE,
      max_mb: MAX_MB,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur signature" },
      { status: 500 }
    );
  }
}

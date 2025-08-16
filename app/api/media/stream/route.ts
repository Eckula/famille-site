import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { v2 as cloudinary } from "cloudinary";

const MODE = (process.env.CLOUDINARY_ACCESS_MODE || "public").toLowerCase();
// download public si pas de VIEWER_PASSWORD
const PUBLIC_DOWNLOADS = !process.env.VIEWER_PASSWORD;

if (MODE === "authenticated") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function GET(req: NextRequest) {
  // si ce n'est PAS public, on exige la session + droit "download"
  if (!PUBLIC_DOWNLOADS) {
    const s = await getSession();
    if (!s || !hasPermission(s.role, "download")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  const { searchParams } = new URL(req.url);
  const public_id = searchParams.get("public_id");
  const resource_type = (searchParams.get("type") as "image" | "video") || "image";
  const format = searchParams.get("format") || undefined;

  if (!public_id) return NextResponse.json({ error: "public_id manquant" }, { status: 400 });

  if (MODE === "authenticated") {
    // URL signée qui expire dans 60s
    const expires_at = Math.floor(Date.now() / 1000) + 60;
    const url = cloudinary.url(public_id, {
      resource_type,
      type: "authenticated",
      sign_url: true,
      secure: true,
      expires_at,
      transformation: [{ flags: "attachment" }],
      format,
    });
    return NextResponse.redirect(url, 302);
  }

  // Mode public (simple redirection)
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const ext = format ? `.${format}` : "";
  const url = `https://res.cloudinary.com/${cloud}/${resource_type}/upload/fl_attachment/${public_id}${ext}`;
  return NextResponse.redirect(url, 302);
}

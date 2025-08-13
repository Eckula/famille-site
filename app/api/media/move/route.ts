// app/api/media/move/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Cloudinary déplace via rename() en donnant un nouveau public_id
function joinFolder(folder: string, base: string) {
  const f = folder.replace(/^\/+|\/+$/g, ""); // trim slashes
  return f ? `${f}/${base}` : base;
}

export async function POST(req: Request) {
  try {
    const { public_id, to_folder }:{public_id:string; to_folder:string} = await req.json();
    if (!public_id || !to_folder) {
      return NextResponse.json({ error: "public_id et to_folder requis" }, { status: 400 });
    }

    const base = public_id.split("/").pop()!; // nom sans dossier
    const newPublicId = joinFolder(to_folder, base);

    // On essaie image, video, raw (comme pour delete)
    const attempt = async (type: "image" | "video" | "raw") => {
      try {
        const res = await cloudinary.uploader.rename(public_id, newPublicId, {
          resource_type: type as any,
          overwrite: false,
        });
        return !!res?.public_id;
      } catch { return false; }
    };

    const moved =
      (await attempt("image")) || (await attempt("video")) || (await attempt("raw"));

    if (!moved) {
      return NextResponse.json({ error: "Déplacement impossible" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, new_public_id: newPublicId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}

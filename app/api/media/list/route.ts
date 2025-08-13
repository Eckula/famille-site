// app/api/media/list/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const DOC_EXTS = new Set([
  "pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","json","xml","md",
  "zip","rar","7z","tar","gz","mp3","wav","aac","m4a","flac","ogg","oga"
]);
const VIDEO_EXTS = new Set(["mp4","mov","webm","mkv","avi","m4v"]);

function detectKind(rt: string, fmt?: string): "image"|"video"|"document" {
  const f = (fmt || "").toLowerCase();
  if (DOC_EXTS.has(f)) return "document";
  if (rt === "video" || VIDEO_EXTS.has(f)) return "video";
  if (rt === "image") return "image";
  return "document";
}

function mapItem(r: any) {
  const kind = detectKind(r.resource_type, r.format);
  let thumb = r.secure_url;
  if (kind === "image") {
    thumb = thumb.replace("/upload/", "/upload/c_fill,w_600,h_400,q_auto,f_auto/");
  } else if (kind === "video") {
    thumb = r.secure_url + "#t=0.5";
  } else {
    thumb = "";
  }
  return {
    id: r.asset_id,
    kind,
    thumb,
    url: r.secure_url,
    title: (r.public_id as string).split("/").pop(),
    createdAt: r.created_at,
    format: (r.format || "").toLowerCase(),
    folder: r.folder || "",
    public_id: r.public_id,
    resource_type: r.resource_type,
  };
}

async function search(expr: string) {
  console.log(`[media/list] Recherche : ${expr}`);
  const [img, vid, raw] = await Promise.all([
    cloudinary.search.expression(`${expr} AND resource_type:image`)
      .max_results(200).sort_by("created_at", "desc").execute(),
    cloudinary.search.expression(`${expr} AND resource_type:video`)
      .max_results(200).sort_by("created_at", "desc").execute(),
    cloudinary.search.expression(`${expr} AND resource_type:raw`)
      .max_results(200).sort_by("created_at", "desc").execute(),
  ]);
  return [...img.resources, ...vid.resources, ...raw.resources];
}

export async function GET() {
  try {
    // 1) Recherche stricte
    let resources = await search('public_id:famille/*');
    console.log("[media/list] Trouvés (public_id) :", resources.map(r => r.public_id));

    // 2) Recherche plus souple
    if (!resources.length) {
      resources = await search('folder:famille*');
      console.log("[media/list] Trouvés (folder) :", resources.map(r => r.public_id));
    }

    // 3) Derniers uploads (filet de sécu)
    if (!resources.length) {
      const recent = await cloudinary.search
        .expression('resource_type:image OR resource_type:video OR resource_type:raw')
        .max_results(50)
        .sort_by('created_at','desc')
        .execute();
      resources = recent.resources;
      console.log("[media/list] Derniers uploads (filet) :", resources.map(r => r.public_id));
    }

    console.log('[media/list] Total final =', resources.length);

    const items = resources.map(mapItem)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[media/list] Erreur :", e?.message || e);
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

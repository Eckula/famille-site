// app/api/media/list/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// extensions documents (inclut audio/archives)
const DOC_EXTS = new Set([
  "pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","json","xml","md",
  "zip","rar","7z","tar","gz",
  "mp3","wav","aac","m4a","flac","ogg","oga"
]);
const VIDEO_EXTS = new Set(["mp4","mov","webm","mkv","avi","m4v"]);

function detectKind(resourceType: string, format?: string): "image"|"video"|"document" {
  const f = (format || "").toLowerCase();
  if (DOC_EXTS.has(f)) return "document";
  if (resourceType === "video" || VIDEO_EXTS.has(f)) return "video";
  if (resourceType === "image") return "image";
  return "document";
}

function mapItem(r: any) {
  const kind = detectKind(r.resource_type, r.format);
  let thumb = r.secure_url as string;
  if (kind === "image") {
    thumb = thumb.replace("/upload/", "/upload/c_fill,w_600,h_400,q_auto,f_auto/");
  } else if (kind === "video") {
    thumb = r.secure_url + "#t=0.5";
  } else {
    thumb = "";
  }
  return {
    id: r.asset_id as string,
    kind,
    thumb,
    url: r.secure_url as string,
    title: (r.public_id as string).split("/").pop(),
    createdAt: r.created_at as string,
    format: (r.format || "").toLowerCase(),
    folder: r.folder || "",
  };
}

async function trySearch(expr: string) {
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
    // 1) ce qu’on visait au départ
    let resources = await trySearch('public_id:famille/*');

    // 2) si vide, on tente par dossier (plus permissif)
    if (!resources.length) {
      resources = await trySearch('folder:famille*');
    }

    // 3) si toujours vide, on prend les 50 derniers uploads tous types
    if (!resources.length) {
      const recent = await cloudinary.search
        .expression('resource_type:image OR resource_type:video OR resource_type:raw')
        .max_results(50)
        .sort_by('created_at','desc')
        .execute();
      resources = recent.resources;
    }

    // log utile en runtime vercel
    console.log('[media/list] count=', resources.length);

    const items = resources.map(mapItem)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[media/list] error:", e?.message || e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}

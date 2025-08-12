// app/api/media/list/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// extensions considérées comme documents (inclut audio/archives)
const DOC_EXTS = new Set([
  "pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","json","xml","md",
  "zip","rar","7z","tar","gz",
  "mp3","wav","aac","m4a","flac","ogg","oga"
]);
const VIDEO_EXTS = new Set(["mp4","mov","webm","mkv","avi","m4v"]);

// détecte le "kind" voulu pour la galerie
function detectKind(resourceType: string, format?: string): "image"|"video"|"document" {
  const f = (format || "").toLowerCase();
  if (DOC_EXTS.has(f)) return "document";
  if (resourceType === "video" || VIDEO_EXTS.has(f)) return "video";
  if (resourceType === "image") return "image";
  // par défaut on classe en document pour éviter qu'un PDF déguisé en image disparaisse
  return "document";
}

function mapItem(r: any) {
  const kind = detectKind(r.resource_type, r.format);
  // miniature
  let thumb = r.secure_url as string;
  if (kind === "image") {
    // vignette optimisée
    thumb = thumb.replace("/upload/", "/upload/c_fill,w_600,h_400,q_auto,f_auto/");
  } else if (kind === "video") {
    // poster vidéo (fallback simple)
    thumb = r.secure_url + "#t=0.5";
  } else {
    thumb = ""; // documents: on affichera une carte texte/icône
  }

  return {
    id: r.asset_id as string,
    kind,                                   // "image" | "video" | "document"
    thumb,
    url: r.secure_url as string,
    title: (r.public_id as string).split("/").pop(),
    createdAt: r.created_at as string,
    format: (r.format || "").toLowerCase(),
    folder: r.folder || "",
  };
}

export async function GET() {
  try {
    const exprBase = "public_id:famille/*"; // tout le dossier + sous-dossiers

    const [img, vid, raw] = await Promise.all([
      cloudinary.search
        .expression(`${exprBase} AND resource_type:image`)
        .max_results(200)
        .sort_by("created_at", "desc")
        .execute(),
      cloudinary.search
        .expression(`${exprBase} AND resource_type:video`)
        .max_results(200)
        .sort_by("created_at", "desc")
        .execute(),
      cloudinary.search
        .expression(`${exprBase} AND resource_type:raw`)
        .max_results(200)
        .sort_by("created_at", "desc")
        .execute(),
    ]);

    const items = [
      ...img.resources.map(mapItem),
      ...vid.resources.map(mapItem),
      ...raw.resources.map(mapItem),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const DOC_EXTS = new Set([
  "pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","zip","rar","7z",
  "json","xml","md"
]);
const AUDIO_EXTS = new Set(["mp3","wav","aac","m4a","flac","ogg","oga"]);
const VIDEO_EXTS = new Set(["mp4","mov","webm","mkv","avi","m4v"]);

function mapItem(r: any) {
  const format = String(r.format || "").toLowerCase();
  const type = String(r.resource_type || "").toLowerCase();

  // Détecte le "kind"
  let kind: "image" | "video" | "file";
  if (type === "image") kind = "image";
  else if (type === "video" || VIDEO_EXTS.has(format)) kind = "video";
  else if (type === "raw" || DOC_EXTS.has(format) || AUDIO_EXTS.has(format)) kind = "file";
  else kind = "file"; // par défaut

  // Miniature
  let thumb = r.secure_url as string;
  if (kind === "image") {
    thumb = thumb.replace("/upload/", "/upload/c_fill,w_600,h_400,q_auto,f_auto/");
  } else if (kind === "video") {
    thumb = r.secure_url + "#t=0.5";
  } else {
    thumb = ""; // on utilisera un rendu “carte document”
  }

  return {
    id: r.asset_id,
    kind,
    thumb,
    url: r.secure_url,
    title: r.public_id.split("/").pop(),
    createdAt: r.created_at,
    folder: r.folder ?? "",
    format,
    resourceType: type,
  };
}

export async function GET() {
  try {
    const exprBase = "public_id:famille/*"; // tous sous-dossiers
    const [img, vid, raw] = await Promise.all([
      cloudinary.search.expression(`${exprBase} AND resource_type:image`).max_results(150).sort_by("created_at","desc").execute(),
      cloudinary.search.expression(`${exprBase} AND resource_type:video`).max_results(150).sort_by("created_at","desc").execute(),
      cloudinary.search.expression(`${exprBase} AND resource_type:raw`).max_results(150).sort_by("created_at","desc").execute(),
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

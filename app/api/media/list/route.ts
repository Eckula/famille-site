// app/api/media/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Important: Cloudinary Admin API = runtime Node
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.env.CLOUDINARY_ROOT_FOLDER || "famille";
const MAX_RESULTS = Math.min(
  Number(process.env.MEDIA_MAX_RESULTS || 5000),
  5000
);

// extensions utiles
const IMAGE_EXTS = ["jpg","jpeg","png","gif","webp","heic","heif","avif","bmp","tiff","svg"];
const AUDIO_EXTS = ["mp3","m4a","aac","wav","flac","ogg","oga"];
const DOC_EXTS   = [
  "pdf","doc","docx","ppt","pptx","xls","xlsx","csv","txt","rtf","zip","rar","7z","tar","gz","json","xml"
];

function ensureCloudinaryConfig() {
  if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary n'est pas configuré (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET).");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

/** Récupère via Search API avec pagination (next_cursor) */
async function searchPaginated(expr: string, maxWanted = MAX_RESULTS) {
  let out: any[] = [];
  let cursor: string | undefined = undefined;

  while (out.length < maxWanted) {
    const q = cloudinary.search
      .expression(expr)                                // ex: resource_type:image AND folder="famille/*"
      .sort_by("created_at", "desc")
      .max_results(500);

    if (cursor) (q as any).next_cursor(cursor);

    const res = await q.execute();
    const items = Array.isArray(res?.resources) ? res.resources : [];
    out = out.concat(items);

    if (!res?.next_cursor) break;
    cursor = res.next_cursor;
  }
  return out.slice(0, maxWanted);
}

function normalize(x: any) {
  const public_id: string = x.public_id;
  const url: string = x.secure_url || x.url || "";
  const format: string = (x.format || "").toLowerCase();
  const resource_type: string = (x.resource_type || "").toLowerCase();
  const folder = (x.folder || public_id.split("/").slice(0, -1).join("/")) || "";

  // détermine notre "kind" unifié
  let kind: "image" | "video" | "audio" | "document" = "image";
  if (resource_type === "image") {
    // les PDF peuvent arriver comme image → document
    kind = format === "pdf" ? "document" : "image";
  } else if (resource_type === "video") {
    kind = AUDIO_EXTS.includes(format) ? "audio" : "video";
  } else {
    kind = "document"; // raw
  }

  return {
    id: x.asset_id || public_id,
    public_id,
    kind,
    title: x.existing || x.original_filename || public_id.split("/").pop() || "",
    url,
    thumb: x.thumbnail_url || x.secure_url || url,
    createdAt: x.created_at || new Date().toISOString(),
    format,
    folder,
    resource_type: resource_type as "image" | "video" | "raw",
  };
}

function filterByTab(items: any[], tab: string) {
  switch (tab) {
    case "images":
      return items.filter((i) => i.kind === "image");
    case "videos":
      return items.filter((i) => i.kind === "video");
    case "audio":
      return items.filter((i) => i.kind === "audio");
    case "documents":
      return items.filter((i) => i.kind === "document");
    default:
      return items;
  }
}

export async function GET(req: NextRequest) {
  try {
    ensureCloudinaryConfig();

    const { searchParams } = new URL(req.url);
    const tab = (searchParams.get("tab") || "all").toLowerCase();

    // On récupère séparément les 3 resource_types pour être robustes :
    //  - images (photos + pdf)
    //  - video  (vidéos + audio)
    //  - raw    (documents type office/zip/etc.)
    const baseFolder = `folder="${ROOT}/*"`;

    const [imgRes, vidRes, rawRes] = await Promise.all([
      // Images (inclut potentiellement des pdf)
      searchPaginated(`resource_type:image AND ${baseFolder}`),
      // Vidéos (inclut aussi l'audio côté Cloudinary)
      searchPaginated(`resource_type:video AND ${baseFolder}`),
      // Documents "fichiers" (raw)
      searchPaginated(`resource_type:raw AND ${baseFolder}`),
    ]);

    // Normalise
    let all = ([] as any[]).concat(imgRes, vidRes, rawRes).map(normalize);

    // Re-catégorise explicitement les extensions si besoin
    all = all.map((i) => {
      const ext = (i.format || "").toLowerCase();
      if (i.resource_type === "image" && ext === "pdf") {
        i.kind = "document";
      }
      if (i.resource_type === "video") {
        i.kind = AUDIO_EXTS.includes(ext) ? "audio" : "video";
      }
      if (i.resource_type === "raw") {
        i.kind = "document";
      }
      return i;
    });

    // Optionnel : éliminer ce qui ne ressemble à aucun type connu
    all = all.filter((i) => {
      const ext = (i.format || "").toLowerCase();
      if (i.kind === "image")  return IMAGE_EXTS.includes(ext);
      if (i.kind === "audio")  return AUDIO_EXTS.includes(ext);
      if (i.kind === "video")  return !AUDIO_EXTS.includes(ext); // garder les vraies vidéos
      if (i.kind === "document") return DOC_EXTS.includes(ext);
      return true;
    });

    // Filtre par onglet
    const filtered = filterByTab(all, tab);

    return NextResponse.json(
      { count: filtered.length, items: filtered },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    // Log clair côté serveur, message explicite côté front
    console.error("[/api/media/list] error:", e?.message || e);
    return NextResponse.json(
      { error: e?.message || "Erreur interne (list)" },
      { status: 500 }
    );
  }
}

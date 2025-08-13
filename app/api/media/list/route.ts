// app/api/media/list/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary (production et local)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DOC = new Set(["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","zip","rar","7z","tar","gz","md"]);
const VID = new Set(["mp4","mov","webm","mkv","avi","m4v"]);

function detect(rt: string, fmt?: string) {
  const f = (fmt || "").toLowerCase();
  if (DOC.has(f)) return "document" as const;
  if (rt === "video" || VID.has(f)) return "video" as const;
  return "image" as const;
}

function map(r: any) {
  const kind = detect(r.resource_type, r.format);
  let thumb = r.secure_url as string;
  if (kind === "image") thumb = thumb.replace("/upload/", "/upload/c_fill,w_600,h_400,q_auto,f_auto/");
  if (kind === "video") thumb = r.secure_url + "#t=0.5";
  if (kind === "document") thumb = "";
  return {
    id: r.asset_id,
    public_id: r.public_id,
    kind,
    url: r.secure_url,
    thumb,
    title: (r.public_id as string).split("/").pop(),
    createdAt: r.created_at,
    format: (r.format || "").toLowerCase(),
    folder: r.folder || "",
  };
}

function err(e: any) {
  return e?.error?.message || e?.response?.error?.message || e?.message || String(e);
}

async function search(expr: string) {
  const [img, vid, raw] = await Promise.all([
    cloudinary.search.expression(`${expr} AND resource_type:image`).max_results(200).sort_by("created_at","desc").execute(),
    cloudinary.search.expression(`${expr} AND resource_type:video`).max_results(200).sort_by("created_at","desc").execute(),
    cloudinary.search.expression(`${expr} AND resource_type:raw`).max_results(200).sort_by("created_at","desc").execute(),
  ]);
  return [...img.resources, ...vid.resources, ...raw.resources];
}

export async function GET() {
  try {
    let res = await search("public_id:famille/*");
    if (!res.length) res = await search("folder:famille*");
    if (!res.length) {
      const recent = await cloudinary.search
        .expression("resource_type:image OR resource_type:video OR resource_type:raw")
        .max_results(50).sort_by("created_at","desc").execute();
      res = recent.resources;
    }
    const items = res.map(map).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: err(e) }, { status: 500 });
  }
}

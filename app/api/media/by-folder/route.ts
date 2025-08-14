export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
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

export async function POST(req: Request) {
  try {
    const { folder } = await req.json();
    if (!folder || typeof folder !== "string") {
      return NextResponse.json({ error: "Paramètre `folder` manquant." }, { status: 400 });
    }

    // on agrège image / video / raw pour ce dossier et sous-dossiers
    const exprBase = `(${[
      "resource_type:image",
      "resource_type:video",
      "resource_type:raw",
    ].join(" OR ")}) AND (folder:${folder}*)`;

    const res = await cloudinary.search.expression(exprBase)
      .max_results(200).sort_by("created_at","desc").execute();

    const items = (res.resources || []).map(map);
    return NextResponse.json({ items });
  } catch (e: any) {
    const msg = e?.error?.message || e?.response?.error?.message || e?.message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

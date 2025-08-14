export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import path from "node:path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function resolveResources(idsOrPublicIds: string[]) {
  const out: Array<{ public_id: string; resource_type: "image" | "video" | "raw" }> = [];
  for (const id of idsOrPublicIds) {
    // Try as public_id via search
    try {
      const search = await cloudinary.search
        .expression(`public_id="${id}"`)
        .max_results(1)
        .execute();
      if (search.resources?.length) {
        const r = search.resources[0];
        out.push({ public_id: r.public_id, resource_type: r.resource_type });
        continue;
      }
    } catch {}

    // Try as asset_id
    try {
      // @ts-ignore
      const r = await cloudinary.api.resource_by_asset_id(id);
      out.push({ public_id: r.public_id, resource_type: r.resource_type });
      continue;
    } catch {}
  }
  return out;
}

function basenamePublicId(public_id: string) {
  // public_id can contain folder(s); keep the last segment
  // Do NOT include extension (Cloudinary public_id has no extension)
  const segments = public_id.split("/");
  return segments[segments.length - 1];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept either `ids` (asset_id[]) or `public_ids` (string[])
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const public_ids_in: string[] = Array.isArray(body?.public_ids) ? body.public_ids : [];
    const toFolder: string = (body?.toFolder || "").trim();

    if ((!ids.length && !public_ids_in.length) || !toFolder) {
      return NextResponse.json(
        { error: "Body invalide. Fournis `ids` (asset_id[]) ou `public_ids` (string[]) ET `toFolder`." },
        { status: 400 }
      );
    }

    // Resolve
    const resolved = [
      ...(await resolveResources(ids)),
      // also resolve resource_type for any provided public_ids
      ...(await resolveResources(public_ids_in)),
    ];

    if (resolved.length === 0) {
      return NextResponse.json({ error: "Aucune ressource trouvée pour les ids fournis." }, { status: 404 });
    }

    const results: { moved: any[]; errors: any[] } = { moved: [], errors: [] };

    // Move each one by rename to new public_id inside toFolder
    for (const r of resolved) {
      const fileBase = basenamePublicId(r.public_id);
      // Construit la cible : toFolder + "/" + basename
      const targetPublicId = path.posix.join(toFolder.replace(/^\/*/, ""), fileBase);

      try {
        const resp = await cloudinary.uploader.rename(r.public_id, targetPublicId, {
          resource_type: r.resource_type,
          type: "upload",
          overwrite: true,
          invalidate: true,
        });
        results.moved.push({ from: r.public_id, to: targetPublicId, response: resp });
      } catch (e: any) {
        results.errors.push({ from: r.public_id, to: targetPublicId, message: e?.message || String(e) });
      }
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur serveur." }, { status: 500 });
  }
}

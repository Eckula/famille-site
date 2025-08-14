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

/**
 * Resolve a batch of ids (asset_id OR public_id) to full resource info
 * so we know each item's public_id and resource_type.
 */
async function resolveResources(idsOrPublicIds: string[]) {
  const out: Array<{ public_id: string; resource_type: "image" | "video" | "raw" }> = [];

  // Try to detect if it "looks like" a public_id (contains "/" or not UUID-like).
  // We still guard by attempting resource_by_asset_id on failures.
  for (const id of idsOrPublicIds) {
    // Fast path: if it looks like a public_id, try to fetch via search (more permissive),
    // otherwise via asset_id.
    let res: any | null = null;

    // 1) Try as public_id first
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

    // 2) Fallback: try as asset_id
    try {
      // @ts-ignore: the SDK exposes resource_by_asset_id at runtime
      const r = await cloudinary.api.resource_by_asset_id(id);
      out.push({ public_id: r.public_id, resource_type: r.resource_type });
      continue;
    } catch {
      // last attempt: explicit (may be unnecessary, but safe)
      // If we still fail, we skip with no throw — we'll report not found later.
    }
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Accept either `ids` (asset_id) or `public_ids`
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const public_ids_in: string[] = Array.isArray(body?.public_ids) ? body.public_ids : [];

    if (!ids.length && !public_ids_in.length) {
      return NextResponse.json({ error: "Body invalide. Fournis `ids` (asset_id[]) ou `public_ids` (string[])." }, { status: 400 });
    }

    // Resolve to public_id + resource_type
    const resolved = [
      ...public_ids_in.map((p) => ({ public_id: p, resource_type: "image" as const })), // type provisoire; on rectifie via search
      ...(await resolveResources(ids)),
    ];

    // For any "public_ids" we injected above, correct their resource_type via search:
    for (let i = 0; i < public_ids_in.length; i++) {
      const pid = public_ids_in[i];
      try {
        const search = await cloudinary.search.expression(`public_id="${pid}"`).max_results(1).execute();
        if (search.resources?.length) {
          const r = search.resources[0];
          resolved[i] = { public_id: r.public_id, resource_type: r.resource_type };
        }
      } catch {}
    }

    if (resolved.length === 0) {
      return NextResponse.json({ error: "Aucune ressource trouvée pour les ids fournis." }, { status: 404 });
    }

    // Group by resource_type
    const byType: Record<"image" | "video" | "raw", string[]> = {
      image: [],
      video: [],
      raw: [],
    };
    for (const r of resolved) {
      if (r.resource_type === "image" || r.resource_type === "video" || r.resource_type === "raw") {
        byType[r.resource_type].push(r.public_id);
      }
    }

    const results: any = { deleted: [], errors: [] };

    // Delete per type
    for (const rt of ["image", "video", "raw"] as const) {
      const list = byType[rt];
      if (!list.length) continue;
      try {
        const resp = await cloudinary.api.delete_resources(list, { resource_type: rt, type: "upload" });
        results.deleted.push({ resource_type: rt, response: resp });
      } catch (e: any) {
        results.errors.push({ resource_type: rt, message: e?.message || String(e) });
      }
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur serveur." }, { status: 500 });
  }
}

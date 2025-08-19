// app/api/media/covers/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const COVERS_CACHE = new Map<string, { at: number; data: any }>();
const COVERS_TTL =
  Number(process.env.COVERS_TTL_MS || 5 * 60 * 1000); // 5 min par défaut

function ok(json: any) {
  return NextResponse.json(json, {
    headers: { "Cache-Control": `s-maxage=${Math.floor(COVERS_TTL / 1000)}` },
  });
}
function err(status: number, message: string, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** GET /api/media/covers?root=<path>
 *  => { covers: Record<folderPath, firstImageUrl|null> }
 */
export async function GET(req: NextRequest) {
  const root = req.nextUrl.searchParams.get("root");
  if (!root) return ok({ covers: {} });

  const key = `covers:${root}`;
  const now = Date.now();
  const cached = COVERS_CACHE.get(key);
  if (cached && now - cached.at < COVERS_TTL) return ok(cached.data);

  try {
    const covers: Record<string, string | null> = {};
    let next_cursor: string | undefined;

    // On pagine prudemment pour éviter de surcharger (max ~1500 résultats)
    for (let i = 0; i < 3; i++) {
      const res = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        prefix: `${root}/`,
        max_results: 500,
        direction: "asc",
        next_cursor,
      });
      for (const r of res.resources ?? []) {
        const folder = (r.folder as string) || "";
        if (folder.startsWith(`${root}/`) && covers[folder] == null) {
          covers[folder] = (r.secure_url as string) || (r.url as string) || null;
        }
      }
      next_cursor = res.next_cursor;
      if (!next_cursor) break;
    }

    const payload = { covers };
    COVERS_CACHE.set(key, { at: now, data: payload });
    return ok(payload);
  } catch (e: any) {
    const code = e?.http_code || e?.status || 500;
    const msg = e?.error?.message || e?.message || String(e);

    if (code === 404 || /not\s*found|cannot find folder/i.test(msg)) {
      const payload = { covers: {} };
      COVERS_CACHE.set(key, { at: now, data: payload });
      return ok(payload);
    }
    if (code === 420 || code === 429 || /rate/i.test(msg)) {
      return err(503, "rate_limited", { retryAfter: 60 });
    }
    return err(500, msg);
  }
}

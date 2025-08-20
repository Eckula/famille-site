// app/api/media/delete/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../../_admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

const chunk = <T,>(arr: T[], n = 100) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

export async function POST(req: NextRequest) {
  const deny = await requireAdmin(req as any);
  if (deny) return deny;

  try {
    const body = await req.json().catch(() => ({}));
    let publicIds: string[] = body?.publicIds || body?.public_ids || body?.ids || [];
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return ok({ error: "publicIds requis (array non vide)" }, 400);
    }
    publicIds = Array.from(new Set(publicIds.filter(Boolean)));

    const summary = { image: 0, video: 0, raw: 0, notFound: 0, errors: [] as string[] };

    for (const rt of ["image", "video", "raw"] as const) {
      for (const grp of chunk(publicIds, 100)) {
        try {
          const res: any = await cloudinary.api.delete_resources(grp, { resource_type: rt, type: "upload" } as any);
          const del = res?.deleted || {};
          let okCount = 0; let nf = 0;
          for (const k of Object.keys(del)) {
            if (del[k] === "deleted") okCount++;
            else if (del[k] === "not_found") nf++;
          }
          (summary as any)[rt] += okCount;
          summary.notFound += nf;
        } catch (e: any) {
          summary.errors.push(e?.error?.message || e?.message || "delete failed");
        }
      }
    }

    return ok({ ok: true, summary });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur interne" }, 500);
  }
}

// app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "../../_admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const { public_ids, ids } = await req.json();
    const list: string[] = Array.isArray(public_ids) ? public_ids : (Array.isArray(ids) ? ids : []);
    if (!list.length) return ok({ error: "Aucun public_id fourni." }, 400);

    const chunk = <T,>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
    const chunks = chunk(list, 100);
    const summary: Record<string, any> = { image: 0, video: 0, raw: 0, errors: [] as any[] };

    for (const rt of ["image", "video", "raw"] as const) {
      for (const c of chunks) {
        try {
          // @ts-ignore
          const res = await cloudinary.api.delete_resources(c, { resource_type: rt, type: "upload" });
          const deleted = Object.values(res?.deleted || {}).filter((v) => v === "deleted").length;
          summary[rt] += deleted;
        } catch (e: any) {
          summary.errors.push({ type: rt, error: e?.error?.message || e?.message || "delete_resources error" });
        }
      }
    }

    return ok({ ok: true, summary });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur suppression Cloudinary." }, 400);
  }
}

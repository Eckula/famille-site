// app/api/media/diag/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/app/api/_admin";

const ok = (data: any, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

function ensureCloudinary() {
  const cn = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ak = process.env.CLOUDINARY_API_KEY;
  const as = process.env.CLOUDINARY_API_SECRET;
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes (cloud_name/api_key/api_secret).");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}

export async function GET(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();
    const ROOT = (process.env.CLOUDINARY_ROOT_FOLDER || "famille").trim();

    const out: any = {
      root: ROOT,
      env: {
        cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "").slice(0, 2) + "***",
        api_key: (process.env.CLOUDINARY_API_KEY || "").slice(0, 3) + "***",
      },
      adminByPrefix: {},
      adminNoPrefix: {},
      searchByFolder: {},
      errors: [] as string[],
    };

    // A) Admin API avec prefix ROOT/ (le cas normal chez toi)
    for (const rt of ["image", "video", "raw"] as const) {
      try {
        // @ts-ignore
        const res = await cloudinary.api.resources({ resource_type: rt, type: "upload", prefix: `${ROOT}/`, max_results: 20 });
        out.adminByPrefix[rt] = {
          count: Array.isArray(res?.resources) ? res.resources.length : 0,
          samples: (res?.resources || []).slice(0, 5).map((r: any) => r.public_id),
        };
      } catch (e: any) {
        out.errors.push(`[admin prefix ${rt}] ${e?.error?.message || e?.message || String(e)}`);
      }
    }

    // B) Admin API sans prefix (pour voir si le compte contient des médias tout court)
    for (const rt of ["image", "video", "raw"] as const) {
      try {
        // @ts-ignore
        const res = await cloudinary.api.resources({ resource_type: rt, type: "upload", max_results: 10 });
        out.adminNoPrefix[rt] = {
          count: Array.isArray(res?.resources) ? res.resources.length : 0,
          samples: (res?.resources || []).slice(0, 5).map((r: any) => r.public_id),
        };
      } catch (e: any) {
        out.errors.push(`[admin noprefix ${rt}] ${e?.error?.message || e?.message || String(e)}`);
      }
    }

    // C) Search API sur folder:"ROOT" / "ROOT/*" (optionnel mais utile)
    try {
      // @ts-ignore
      const q = cloudinary.search.expression(`folder="${ROOT}" OR folder="${ROOT}/*"`).max_results(10);
      const res = await q.execute();
      out.searchByFolder = {
        count: Array.isArray(res?.resources) ? res.resources.length : 0,
        samples: (res?.resources || []).slice(0, 5).map((r: any) => r.public_id),
      };
    } catch (e: any) {
      out.errors.push(`[search] ${e?.error?.message || e?.message || String(e)}`);
    }

    return ok(out);
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur diag" }, 500);
  }
}

// app/api/media/move/route.ts
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
  if (!cn || !ak || !as) throw new Error("Cloudinary: variables manquantes.");
  cloudinary.config({ cloud_name: cn, api_key: ak, api_secret: as, secure: true });
}
const baseName = (pid: string) => (pid.lastIndexOf("/") >= 0 ? pid.slice(pid.lastIndexOf("/") + 1) : pid);

export async function POST(req: Request) {
  const deny = await requireAdmin(req);
  if (deny) return deny;

  try {
    ensureCloudinary();

    const body = await req.json().catch(() => ({}));
    const { public_ids, publicIds, ids, toFolder } = body;
    const list: string[] = (public_ids || publicIds || ids || []).filter(Boolean);
    const target = String(toFolder || "").trim().replace(/\/+$/, "");

    if (!list.length) return ok({ error: "Aucun public_id fourni." }, 400);
    if (!target) return ok({ error: "toFolder requis." }, 400);

    const moved: string[] = [];
    const skipped: string[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    for (const pid of list) {
      const toId = `${target}/${baseName(pid)}`;
      if (pid === toId) { skipped.push(pid); continue; }

      let done = false;
      for (const rt of ["image", "video", "raw"] as const) {
        try {
          const res: any = await cloudinary.uploader.rename(pid, toId, {
            resource_type: rt, type: "upload", overwrite: false,
          } as any);
          if (res?.public_id) { moved.push(pid); done = true; break; }
        } catch (e: any) {
          const msg = e?.error?.message || e?.message || "";
          if (!/not found|resource_type/i.test(msg)) {
            errors.push({ id: pid, error: msg || "rename error" });
            done = true; break;
          }
        }
      }
      if (!done) skipped.push(pid);
    }

    return ok({ ok: true, moved: moved.length, skipped: skipped.length, errors, details: { moved, skipped } });
  } catch (e: any) {
    return ok({ error: e?.message || "Erreur déplacement Cloudinary." }, 400);
  }
}

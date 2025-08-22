// app/api/media/debug-check/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

const json = (d: any, s = 200) =>
  NextResponse.json(d, { status: s, headers: { "Cache-Control": "no-store" } });

function ensureCloudinary() {
  const cloud_name =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Cloudinary non configuré (cloud_name / api_key / api_secret)");
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const public_id = (url.searchParams.get("public_id") || "").trim();

  if (!public_id) {
    return json({ error: "Query ?public_id= requis" }, 400);
  }

  try {
    // 1) DB
    const row = await prisma.mediaIndex.findUnique({
      where: { publicId: public_id },
      select: { publicId: true, appFolderId: true, createdAt: true },
    });

    // 2) Cloudinary (essayer image -> video -> raw)
    let clFound: any = null;
    try {
      ensureCloudinary();
      const tryTypes: Array<"image" | "video" | "raw"> = ["image", "video", "raw"];
      for (const rt of tryTypes) {
        const res: any = await cloudinary.api.resources_by_ids([public_id], {
          resource_type: rt,
          type: "upload",
        } as any);
        const r = Array.isArray(res?.resources) ? res.resources[0] : undefined;
        if (r) {
          clFound = {
            resource_type: r.resource_type,
            format: r.format,
            created_at: r.created_at,
            secure_url: r.secure_url,
          };
          break;
        }
      }
    } catch (e: any) {
      clFound = { error: e?.message || "lookup cloudinary failed" };
    }

    return json({
      public_id,
      in_db: !!row,
      db_row: row || null,
      cloudinary: clFound ? { found: true, ...clFound } : { found: false },
    });
  } catch (e: any) {
    return json({ error: e?.message || "debug-check failed" }, 500);
  }
}

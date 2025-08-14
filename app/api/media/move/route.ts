// app/api/media/move/route.ts
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

async function findResource(public_id: string) {
  // essaie image, video, raw
  for (const rt of ["image","video","raw"] as const) {
    try {
      const res = await cloudinary.api.resource(public_id, { resource_type: rt });
      return { rt, res };
    } catch {}
  }
  throw new Error(`Introuvable: ${public_id}`);
}

export async function POST(req: Request) {
  try {
    const { ids, toFolder }:{ ids:string[]; toFolder:string } = await req.json();
    if (!ids?.length || !toFolder) return NextResponse.json({ error: "ids/toFolder requis" }, { status: 400 });

    const results:any[] = [];
    for (const id of ids) {
      // id peut être asset_id ou public_id, on privilégie public_id
      let public_id = id;
      // si on reçoit un asset_id côté client, adapte ici (optionnel)

      const { rt, res } = await findResource(public_id);
      const base = (res.public_id as string).split("/").pop()!;
      const target = `${toFolder.replace(/\/+$/,"")}/${base}`;

      const moved = await cloudinary.uploader.rename(res.public_id, target, {
        resource_type: rt, overwrite: true,
      });
      results.push({ from: res.public_id, to: target, rt, moved });
    }
    return NextResponse.json({ ok:true, results });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

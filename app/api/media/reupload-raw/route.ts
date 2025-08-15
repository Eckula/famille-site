// app/api/media/reupload-raw/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const public_id = String(form.get("public_id") || "");
    const file = form.get("file") as unknown as File | null;

    if (!public_id || !file) {
      return NextResponse.json({ error: "public_id et fichier requis" }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const buffer = Buffer.from(ab);

    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id,
          overwrite: true,
          invalidate: true,
        },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      stream.end(buffer);
    });

    // on essaye de supprimer la vieille ressource image (si elle existait)
    try { await cloudinary.api.delete_resources([public_id], { resource_type: "image" }); } catch {}

    return NextResponse.json({ ok: true, up: { secure_url: result.secure_url } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "reupload raw failed" }, { status: 500 });
  }
}

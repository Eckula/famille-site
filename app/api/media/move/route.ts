import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const { ids, targetFolder } = await req.json().catch(() => ({}));
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !targetFolder) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    const results = await Promise.all(
      ids.map(async (oldId: string) => {
        const filename = oldId.split("/").pop();
        const newId = `${targetFolder.replace(/\/+$/,"")}/${filename}`;
        return await cloudinary.uploader.rename(oldId, newId, { overwrite: true });
      })
    );
    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "move failed" }, { status: 500 });
  }
}

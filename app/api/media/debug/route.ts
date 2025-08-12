export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    // 1) vérifie les env côté serveur
    const envOk = {
      name: !!process.env.CLOUDINARY_CLOUD_NAME,
      key: !!process.env.CLOUDINARY_API_KEY,
      secret: !!process.env.CLOUDINARY_API_SECRET,
    };

    // 2) fait une petite recherche (1 asset max) pour tester l'Admin API
    const one = await cloudinary.search
      .expression("resource_type:image")  // expression minimaliste
      .max_results(1)
      .execute();

    return NextResponse.json({
      envOk,
      found: one?.resources?.length || 0,
      sample: one?.resources?.[0]?.public_id || null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

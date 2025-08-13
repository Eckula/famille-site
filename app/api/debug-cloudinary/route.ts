// app/api/debug-cloudinary/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME ? "OK" : "❌",
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY ? "OK" : "❌",
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET ? "OK" : "❌"
  });
}


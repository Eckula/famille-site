// app/api/whereami/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // pour récupérer les en-têtes Geo en prod

export async function GET(req: NextRequest) {
  const h = req.headers;

  const city = h.get("x-vercel-ip-city") ?? "";
  const country = h.get("x-vercel-ip-country") ?? "";
  const region = h.get("x-vercel-ip-country-region") ?? "";
  const asn = h.get("x-vercel-ip-asn") ?? "";
  const latitude =
    Number.parseFloat(h.get("x-vercel-ip-latitude") ?? "") || null;
  const longitude =
    Number.parseFloat(h.get("x-vercel-ip-longitude") ?? "") || null;

  return NextResponse.json({
    ok: true,
    city,
    country,
    region,
    asn,
    latitude,
    longitude,
  });
}

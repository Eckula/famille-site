// app/api/whereami/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  const h = headers();
  const city = h.get("x-vercel-ip-city") || "";
  const country = h.get("x-vercel-ip-country") || "";
  const lat = parseFloat(h.get("x-vercel-ip-latitude") || "");
  const lon = parseFloat(h.get("x-vercel-ip-longitude") || "");

  const out = {
    city: city || "Saint-Fons",
    country: country || "FR",
    lat: Number.isFinite(lat) ? lat : 45.712,
    lon: Number.isFinite(lon) ? lon : 4.8608,
    source: city || Number.isFinite(lat) ? "ip" : "fallback",
  };
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

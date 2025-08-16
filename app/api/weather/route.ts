// app/api/weather/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // nécessaire pour recevoir les en-têtes Geo de Vercel

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENWEATHER_API_KEY" }, { status: 500 });
  }

  // 1) Priorité aux paramètres explicites (GPS du navigateur)
  let lat = searchParams.get("lat") ?? undefined;
  let lon = searchParams.get("lon") ?? undefined;
  let city = searchParams.get("city") ?? undefined;

  // 2) Sinon, tenter la géo IP Vercel (aucune popup)
  if (!lat || !lon) {
    lat = req.headers.get("x-vercel-ip-latitude") ?? undefined;
    lon = req.headers.get("x-vercel-ip-longitude") ?? undefined;
  }
  if (!city) {
    city = req.headers.get("x-vercel-ip-city") ?? process.env.DEFAULT_CITY ?? "Lyon";
  }

  const qs = new URLSearchParams({
    appid: apiKey,
    units: "metric",
    lang: "fr",
  });

  if (lat && lon) {
    qs.set("lat", lat);
    qs.set("lon", lon);
  } else if (city) {
    qs.set("q", city);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${qs.toString()}`;
  const r = await fetch(url, { next: { revalidate: 600 } }); // 10 min de cache côté edge

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    return NextResponse.json({ error: "Upstream error", detail: text }, { status: r.status });
  }

  const d = await r.json();

  const payload = {
    name: d?.name,
    country: d?.sys?.country,
    temp: Math.round(d?.main?.temp),
    feels_like: Math.round(d?.main?.feels_like ?? d?.main?.temp),
    description: d?.weather?.[0]?.description,
    icon: d?.weather?.[0]?.icon,
    wind_kmh: d?.wind?.speed ? Math.round(d.wind.speed * 3.6) : null, // m/s -> km/h
    dt: d?.dt,
    timezone: d?.timezone,
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=300" },
  });
}

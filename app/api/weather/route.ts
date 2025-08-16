import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city") || process.env.DEFAULT_CITY || "Lyon";

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENWEATHER_API_KEY" }, { status: 500 });
  }

  const qs = new URLSearchParams({
    appid: apiKey,
    units: "metric",
    lang: "fr",
  });

  if (lat && lon) {
    qs.set("lat", lat);
    qs.set("lon", lon);
  } else {
    qs.set("q", city);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?${qs.toString()}`;

  const r = await fetch(url, { next: { revalidate: 600 } }); // 10 min côté edge
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    return NextResponse.json({ error: "Upstream error", detail: text }, { status: r.status });
  }

  const d = await r.json();

  // Réponse simplifiée pour le client
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

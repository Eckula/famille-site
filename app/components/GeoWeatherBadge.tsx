// app/components/GeoWeatherBadge.tsx
"use client";

import { useEffect, useState } from "react";

type Weather = {
  name?: string;
  country?: string;
  temp: number | null;
  feels_like?: number | null;
  description?: string;
};

type Pref =
  | { source: "gps"; lat: number; lon: number; city?: string }
  | { source: "manual"; lat: number; lon: number; city?: string };

export default function GeoWeatherBadge() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [w, setW] = useState<Weather | null>(null);
  const [source, setSource] = useState<"ip" | "gps" | "manual" | "fallback">("ip");

  async function fetchWeather(q?: { lat?: number; lon?: number; city?: string }) {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (q?.lat != null && q?.lon != null) {
        qs.set("lat", String(q.lat));
        qs.set("lon", String(q.lon));
      } else if (q?.city) {
        qs.set("city", q.city);
      }
      const url = `/api/weather${qs.size ? `?${qs.toString()}` : ""}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Erreur météo");

      setW({
        name: j?.name,
        country: j?.country,
        temp: typeof j?.temp === "number" ? Math.round(j.temp) : null,
        feels_like:
          typeof j?.feels_like === "number" ? Math.round(j.feels_like) : null,
        description: j?.description,
      });
    } catch (e: any) {
      setErr(e?.message || "Erreur inconnue");
      setW(null);
    } finally {
      setLoading(false);
    }
  }

  // 1) Démarrage : préférence sauvegardée > IP (headers Vercel) > fallback .env
  useEffect(() => {
    const raw = localStorage.getItem("geo.pref");
    if (raw) {
      try {
        const p: Pref = JSON.parse(raw);
        if (typeof p?.lat === "number" && typeof p?.lon === "number") {
          setSource(p.source);
          fetchWeather({ lat: p.lat, lon: p.lon });
          return;
        }
      } catch {
        // ignore
      }
    }
    setSource("ip");
    fetchWeather(); // sans params => /api/weather utilisera les en-têtes IP
  }, []);

  // 2) Pastille rouge : forcer la position GPS
  function forceGPS() {
    if (!("geolocation" in navigator)) {
      alert("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lon = +pos.coords.longitude.toFixed(5);
        const pref: Pref = { source: "gps", lat, lon, city: "Ma position" };
        localStorage.setItem("geo.pref", JSON.stringify(pref));
        setSource("gps");
        fetchWeather({ lat, lon });
      },
      (err) => {
        alert(
          `Impossible de récupérer la position (code ${err.code}).\nAstuce : autorise l’accès à la position dans ton navigateur.`
        );
      }
    );
  }

  // 3) Petite pastille grise : revenir à la géo IP
  function resetToIP() {
    localStorage.removeItem("geo.pref");
    setSource("ip");
    fetchWeather();
  }

  return (
    <div className="flex items-center gap-2">
      {/* pastille rouge = forcer GPS */}
      <button
        onClick={forceGPS}
        title="Forcer la position de l’appareil (GPS)"
        aria-label="Forcer la position (GPS)"
        className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-white/60 hover:ring-white"
      />
      {/* pastille grise = revenir à IP */}
      <button
        onClick={resetToIP}
        title="Revenir à la position IP"
        aria-label="Revenir à la position IP"
        className="w-3 h-3 rounded-full bg-white/60 ring-2 ring-white/60 hover:ring-white"
      />

      <div className="px-2 py-1 rounded-full bg-black/50 text-white text-xs leading-none">
        {loading ? "…" : w?.temp ?? "—"}°C
        <span className="ml-2 opacity-90">
          {w?.name ? `${w.name}${w.country ? `, ${w.country}` : ""}` : ""}
        </span>
        <span className="ml-1 opacity-75">
          {source === "gps" ? "📍" : source === "ip" ? "🌐" : "◔"}
        </span>
      </div>

      {err ? (
        <span className="text-[10px] text-red-300 ml-1 max-w-[12rem] truncate" title={err}>
          {err}
        </span>
      ) : null}
    </div>
  );
}

// app/components/WeatherBadge.tsx
"use client";

import { useEffect, useState } from "react";

type Weather = { name?: string; country?: string; temp: number | null; description?: string; };
type Pref = { source: "gps"; lat: number; lon: number; city?: string } | { source: "ip" };

export default function WeatherBadge() {
  const [w, setW] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState<"ip" | "gps">("ip");
  const [err, setErr] = useState<string | null>(null);

  async function load(q?: { lat?: number; lon?: number; city?: string }) {
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
        temp: typeof j?.temp === "number" ? j.temp : null,
        description: j?.description,
      });
    } catch (e: any) {
      setErr(e?.message || "Erreur");
      setW(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const raw = localStorage.getItem("geo.pref");
    if (raw) {
      try {
        const p: Pref = JSON.parse(raw);
        if (p?.source === "gps" && typeof (p as any).lat === "number") {
          setSrc("gps");
          load({ lat: (p as any).lat, lon: (p as any).lon });
          return;
        }
      } catch {}
    }
    setSrc("ip");
    load(); // géo IP côté API
  }, []);

  function forceGPS() {
    if (!("geolocation" in navigator)) {
      alert("Géolocalisation indisponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lon = +pos.coords.longitude.toFixed(5);
        localStorage.setItem("geo.pref", JSON.stringify({ source: "gps", lat, lon }));
        setSrc("gps");
        load({ lat, lon });
      },
      (e) => {
        alert(`Impossible d'obtenir la position (code ${e.code}). Autorise l'accès à la position dans ton navigateur.`);
      }
    );
  }

  function backToIP() {
    localStorage.setItem("geo.pref", JSON.stringify({ source: "ip" }));
    setSrc("ip");
    load();
  }

  const label = loading ? "…" : w?.temp != null ? `${w.temp}°` : "—°";
  const city = w?.name ? `${w.name}${w.country ? `, ${w.country}` : ""}` : "";

  return (
    <div className="flex items-center">
      {/* pastille rouge (GPS) */}
      <button
        onClick={forceGPS}
        aria-label="Forcer la position (GPS)"
        title="Forcer la position de l’appareil (GPS)"
        className="w-2.5 h-2.5 rounded-full bg-red-600 mr-2 ring-2 ring-white/70 hover:ring-white cursor-pointer"
      />
      {/* badge météo (clic = revenir à IP) */}
      <button
        onClick={backToIP}
        title={src === "gps" ? "Position: GPS (cliquer pour revenir sur la position IP)" : "Position: IP (cliquer pour rafraîchir)"}
        className="px-3 py-1 rounded-full bg-black/50 text-white text-xs leading-none border border-white/20 cursor-pointer"
      >
        {label}
        {city ? <span className="ml-2 opacity-90">{city}</span> : null}
        <span className="ml-1">{src === "gps" ? "📍" : "🌐"}</span>
      </button>
      {err ? (
        <span className="ml-2 text-[10px] text-red-300 truncate max-w-[12rem]" title={err}>
          {err}
        </span>
      ) : null}
    </div>
  );
}

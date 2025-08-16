// app/components/WeatherWidget.tsx
"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type Coords = { lat: number; lon: number };
type WeatherData = {
  name: string; country?: string;
  temp: number; feels_like?: number;
  description?: string; icon?: string;
  wind_kmh?: number | null;
  timezone?: number; // offset en secondes vs UTC
};

function cx(...xs: Array<string | false | null | undefined>) { return xs.filter(Boolean).join(" "); }

function fmtLocalTime(tz?: number) {
  const now = Date.now();
  const localOffset = new Date().getTimezoneOffset() * 60_000;
  const utc = now + localOffset;
  const target = utc + (tz ?? 0) * 1000;
  return new Date(target).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function WeatherWidget({ fallbackCity = "Lyon", className = "" }: { fallbackCity?: string; className?: string }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData]     = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [clock, setClock] = useState<string>("");

  // 1) météo par IP
  useEffect(() => {
    let cancelled = false;
    const ctl = new AbortController();
    setLoading(true); setErr(null);

    fetch("/api/weather", { signal: ctl.signal, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("Erreur réseau"); return r.json() as Promise<WeatherData>; })
      .then((j) => { if (!cancelled) setData(j); })
      .catch((e) => { if (!cancelled) setErr((e as Error).message || "Impossible de charger"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; ctl.abort(); };
  }, []);

  // 2) affiner au GPS si permission déjà accordée
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!("geolocation" in navigator)) return;
        const navAny = navigator as any;
        if (!navAny.permissions?.query) return;
        const st = await navAny.permissions.query({ name: "geolocation" as any });
        if (st.state !== "granted") return;
        const t = window.setTimeout(() => !cancelled && setCoords(null), 7000);
        navigator.geolocation.getCurrentPosition(
          (pos) => { if (cancelled) return; window.clearTimeout(t); setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
          () => { if (cancelled) return; window.clearTimeout(t); },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 }
        );
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // 3) météo précise si coords
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    const ctl = new AbortController();
    setLoading(true);
    fetch(`/api/weather?lat=${coords.lat.toFixed(4)}&lon=${coords.lon.toFixed(4)}`, { signal: ctl.signal, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("Erreur réseau"); return r.json() as Promise<WeatherData>; })
      .then((j) => { if (!cancelled) setData(j); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; ctl.abort(); };
  }, [coords]);

  // 4) horloge : met à jour chaque seconde selon le timezone de la météo
  useEffect(() => {
    function tick() { setClock(fmtLocalTime(data?.timezone)); }
    tick(); // premier affichage
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [data?.timezone]);

  const temp = data?.temp;
  const city = data?.name || fallbackCity;
  const iconUrl = data?.icon ? `https://openweathermap.org/img/wn/${data.icon}.png` : null;

  return (
    <div className={cx("relative", className)} aria-live="polite">
      <div className="flex flex-col items-end">
        <div className={cx(
          "inline-flex items-center gap-2 rounded-full",
          "border border-white/30 bg-black/30 px-3 py-1.5 text-white backdrop-blur",
          "hover:bg-white/10 transition select-none"
        )}>
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          ) : iconUrl ? (
            <img src={iconUrl} alt="" width={20} height={20} className="h-5 w-5" />
          ) : (
            <span aria-hidden>⛅</span>
          )}
          <span className="tabular-nums">{Number.isFinite(temp) ? temp : "—"}°</span>
          <span className="inline max-w-[38vw] truncate whitespace-nowrap sm:max-w-none" title={city}>{city}</span>
        </div>

        {/* Heure visible en permanence (gris) */}
        <div className="mt-1 text-right text-xs text-white/70 tabular-nums">{clock}</div>
      </div>
    </div>
  );
}

// app/components/WeatherWidget.tsx
"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";

type Coords = { lat: number; lon: number };
type WeatherData = {
  name: string;
  country?: string;
  temp: number;
  feels_like?: number;
  description?: string;
  icon?: string;
  wind_kmh?: number | null;
  dt?: number;
  timezone?: number; // offset en secondes vs UTC
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function formatLocalTime(timezoneSec?: number) {
  const now = Date.now();
  const localOffsetMs = new Date().getTimezoneOffset() * 60_000;
  const utcMs = now + localOffsetMs;               // ramener heure locale → UTC
  const targetMs = utcMs + (timezoneSec ?? 0) * 1000;
  return new Date(targetMs).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function WeatherWidget({
  fallbackCity = "Lyon",
  className = "",
}: { fallbackCity?: string; className?: string }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // pour rafraîchir l’heure

  // 1) météo par IP (aucune popup)
  useEffect(() => {
    let cancelled = false;
    const ctl = new AbortController();
    setLoading(true); setErr(null);

    fetch(`/api/weather`, { signal: ctl.signal, cache: "no-store" })
      .then(r => { if (!r.ok) throw new Error("Erreur réseau"); return r.json() as Promise<WeatherData>; })
      .then(j => !cancelled && setData(j))
      .catch(e => !cancelled && setErr((e as Error).message || "Impossible de charger"))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; ctl.abort(); };
  }, []);

  // 2) affiner au GPS si permission déjà accordée (silencieux)
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
      .then(r => { if (!r.ok) throw new Error("Erreur réseau"); return r.json() as Promise<WeatherData>; })
      .then(j => !cancelled && setData(j))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; ctl.abort(); };
  }, [coords]);

  // 4) rafraîchir l’heure chaque seconde
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const localTime = useMemo(() => formatLocalTime(data?.timezone), [data?.timezone, tick]);

  const temp = data?.temp;
  const city = data?.name || fallbackCity;
  const iconUrl = data?.icon ? `https://openweathermap.org/img/wn/${data.icon}.png` : null;

  return (
    <div className={cx("relative", className)} aria-live="polite">
      {/* on empile pastille + ligne d'heure en dessous */}
      <div className="flex flex-col items-end">
        {/* pastille */}
        <div
          className={cx(
            "inline-flex items-center gap-2 rounded-full",
            "border border-white/30 bg-black/30 px-3 py-1.5 text-white backdrop-blur",
            "hover:bg-white/10 transition select-none"
          )}
        >
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          ) : iconUrl ? (
            <img src={iconUrl} alt="" width={20} height={20} className="h-5 w-5" />
          ) : (
            <span aria-hidden>⛅</span>
          )}
          <span className="tabular-nums">{Number.isFinite(temp) ? temp : "—"}°</span>
          <span className="inline max-w-[38vw] truncate whitespace-nowrap sm:max-w-none" title={city}>
            {city}
          </span>
        </div>

        {/* heure toujours visible sous la pastille */}
        <div className="mt-1 text-right text-xs text-white/70 tabular-nums">
          {localTime}
        </div>
      </div>

      {/* panneau détaillé au survol (desktop) */}
      <div
        className={cx(
          "pointer-events-none absolute right-0 mt-2 w-64 rounded-2xl",
          "border border-white/25 bg-black/85 p-3 text-sm text-white shadow-lg backdrop-blur",
          "opacity-0 translate-y-1 transition",
          "group-hover:opacity-100 group-hover:translate-y-0"
        )}
        role="dialog"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
            <span>Chargement…</span>
          </div>
        ) : err ? (
          <div className="text-red-200">{err}</div>
        ) : data ? (
          <div className="space-y-1">
            <div className="font-medium">
              {data.name}{data.country ? `, ${data.country}` : ""}
            </div>
            <div className="text-white/90 capitalize">{data.description}</div>
            <div className="text-white/80">Ressenti {data.feels_like}° — Vent {data.wind_kmh ?? "—"} km/h</div>
            <div className="pt-1 text-white/80">🕒 {localTime}</div>
          </div>
        ) : (
          <div>Aucune donnée météo</div>
        )}
      </div>
    </div>
  );
}

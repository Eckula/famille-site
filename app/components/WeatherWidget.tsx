// app/components/WeatherWidget.tsx

"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type Coords = { lat: number; lon: number };

type WeatherData = {
  name: string;
  country?: string;
  temp: number;            // °C
  feels_like?: number;     // °C
  description?: string;    // ex: "ciel dégagé"
  icon?: string;           // ex: "10d"
  wind_kmh?: number | null;
  dt?: number;
  timezone?: number;
};

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function WeatherWidget({
  fallbackCity = "Lyon",
  className = "",
}: {
  fallbackCity?: string;
  className?: string;
}) {
  // ✅ on typede explicitement les states
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  // Géolocalisation (avec timeout)
  useEffect(() => {
    let cancelled = false;

    if (!navigator.geolocation) {
      setCoords(null);
      return;
    }

    const t = window.setTimeout(() => {
      if (!cancelled) setCoords(null);
    }, 7000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        window.clearTimeout(t);
        // ✅ setCoords reçoit bien un objet de type Coords
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        if (cancelled) return;
        window.clearTimeout(t);
        setCoords(null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 }
    );

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  // Appel API interne
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    const params = coords
      ? `lat=${coords.lat.toFixed(4)}&lon=${coords.lon.toFixed(4)}`
      : `city=${encodeURIComponent(fallbackCity)}`;

    fetch(`/api/weather?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Erreur réseau");
        return (await r.json()) as WeatherData;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled) setErr((e as Error)?.message || "Impossible de charger la météo");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coords, fallbackCity]);

  const temp = data?.temp;
  const city = data?.name || fallbackCity;
  const iconUrl = data?.icon ? `https://openweathermap.org/img/wn/${data.icon}.png` : null;

  return (
    <div className={cx("group relative", className)} aria-live="polite">
      {/* pastille compacte */}
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

        {/* Ville toujours visible, tronquée sur tout petits écrans */}
        <span className="inline max-w-[40vw] truncate whitespace-nowrap sm:max-w-none" title={city}>
          {city}
        </span>
      </div>

      {/* panneau détaillé au survol/focus (desktop) */}
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
              {data.name}
              {data.country ? `, ${data.country}` : ""}
            </div>
            <div className="text-white/90 capitalize">{data.description}</div>
            <div className="text-white/80">
              Ressenti {data.feels_like}° — Vent {data.wind_kmh ?? "—"} km/h
            </div>
          </div>
        ) : (
          <div>Aucune donnée météo</div>
        )}
      </div>
    </div>
  );
}

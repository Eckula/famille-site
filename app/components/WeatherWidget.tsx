// app/components/WeatherWidget.tsx

"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

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
  const [coords, setCoords] = useState<Coords | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [refining, setRefining] = useState<boolean>(false); // état du bouton 📍

  // ---- 1) Première charge : météo IP (ou DEFAULT_CITY en dev) ----
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    // Pas de params => l'API utilise IP ou DEFAULT_CITY
    fetch(`/api/weather`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Erreur réseau");
        return (await r.json()) as WeatherData;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setErr((e as Error)?.message || "Impossible de charger la météo");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // ---- 2) Si permission "granted", affiner automatiquement (pas de popup) ----
  useEffect(() => {
    let cancelled = false;

    async function refineIfGranted() {
      try {
        if (!("geolocation" in navigator)) return;

        // Permissions API (silencieux)
        const navAny = navigator as any;
        if ("permissions" in navigator && navAny.permissions?.query) {
          const status = await navAny.permissions.query({
            // @ts-ignore – PermissionName pas toujours typé strict
            name: "geolocation",
          });
          if (status.state !== "granted") return; // ne déclenche pas de popup
        } else {
          // pas de Permissions API : on ne tente rien (sinon ça poperait)
          return;
        }

        const t = window.setTimeout(() => !cancelled && setCoords(null), 7000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            window.clearTimeout(t);
            setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          },
          () => {
            if (cancelled) return;
            window.clearTimeout(t);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 }
        );
      } catch {
        // silencieux
      }
    }

    refineIfGranted();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- 3) Quand on obtient des coords (auto ou via bouton), recharger météo précise ----
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);

    const params = `lat=${coords.lat.toFixed(4)}&lon=${coords.lon.toFixed(4)}`;
    fetch(`/api/weather?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("Erreur réseau");
        return (await r.json()) as WeatherData;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
        setRefining(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coords]);

  // ---- 4) Bouton "Ma position" (déclenche la popup seulement si l'utilisateur clique) ----
  function askForGeolocation() {
    if (!("geolocation" in navigator)) return;
    setRefining(true);
    setErr(null);

    const t = window.setTimeout(() => setRefining(false), 9000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(t);
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (e) => {
        window.clearTimeout(t);
        setRefining(false);
        // e.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
        if (e?.code === 1) setErr("Localisation refusée.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 }
    );
  }

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
        <span className="inline max-w-[38vw] truncate whitespace-nowrap sm:max-w-none" title={city}>
          {city}
        </span>

        {/* Bouton Ma position */}
        <button
          type="button"
          onClick={askForGeolocation}
          title="Utiliser ma position"
          aria-label="Utiliser ma position"
          className={cx(
            "ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full",
            "border border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
          )}
        >
          {refining ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
          ) : (
            <span aria-hidden>📍</span>
          )}
        </button>
      </div>

      {/* panneau détaillé (desktop au survol) */}
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

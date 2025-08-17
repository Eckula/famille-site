"use client";

import { useEffect, useRef, useState } from "react";

type Weather = {
  name?: string;
  country?: string;
  temp?: number | null;
  description?: string | null;
};

const LS_KEY = "weather_use_gps";

export default function WeatherWidget() {
  // UI state
  const [data, setData] = useState<Weather>({});
  const [timeStr, setTimeStr] = useState(""); // rendu seulement côté client
  const [useGPS, setUseGPS] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const gpsCoords = useRef<{ lat: number; lon: number } | null>(null);

  /* ---- clock (client-only) ---- */
  useEffect(() => {
    const t = () => {
      const d = new Date();
      // pas de 12h, rendu stable
      setTimeStr(
        d.toLocaleTimeString("fr-FR", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  /* ---- initial GPS preference ---- */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    setUseGPS(raw === "1");
  }, []);

  /* ---- fetch weather ---- */
  async function fetchWeather(opts?: { lat?: number; lon?: number }) {
    setLoading(true);
    try {
      const u = new URL("/api/weather", window.location.origin);
      if (opts?.lat != null && opts?.lon != null) {
        u.searchParams.set("lat", String(opts.lat));
        u.searchParams.set("lon", String(opts.lon));
      }
      const r = await fetch(u.toString(), { cache: "no-store" });
      let j: any = null;
      try {
        j = await r.json();
      } catch {
        j = null;
      }
      if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
      setData({
        name: j?.name,
        country: j?.country,
        temp: typeof j?.temp === "number" ? j.temp : null,
        description: j?.description ?? null,
      });
    } catch (e) {
      // garde l’ancien affichage si erreur
      // (optionnel: setData({}))
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---- GPS handling ---- */
  async function enableGPS() {
    return new Promise<void>((resolve) => {
      if (!navigator.geolocation) {
        resolve();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          gpsCoords.current = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          fetchWeather(gpsCoords.current);
          resolve();
        },
        () => {
          // si refus, rester sur IP
          setUseGPS(false);
          localStorage.setItem(LS_KEY, "0");
          fetchWeather();
          resolve();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 }
      );
    });
  }

  // (re)charger à chaque changement de mode
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      if (useGPS) {
        await enableGPS();
      } else {
        await fetchWeather();
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useGPS]);

  function toggleMode() {
    const next = !useGPS;
    setUseGPS(next);
    localStorage.setItem(LS_KEY, next ? "1" : "0");
  }

  const tempTxt =
    data.temp == null || Number.isNaN(data.temp) ? "--°" : `${Math.round(data.temp)}°`;
  const cityTxt =
    [data.name, data.country].filter(Boolean).join(", ") || (loading ? "Chargement…" : "");

  return (
    <div className="fixed right-3 top-3 z-[60] select-none">
      {/* pastille + badge */}
      <div
        className="
          rounded-full bg-black/60 ring-1 ring-white/15 backdrop-blur
          px-3.5 py-1.5 md:px-4 md:py-2
          text-white shadow-[0_1px_8px_rgba(0,0,0,0.35)]
        "
      >
        <div className="flex items-center gap-2">
          {/* pastille rouge : clique = bascule GPS/IP */}
          <button
            type="button"
            onClick={toggleMode}
            title={useGPS ? "Mode GPS (cliquer pour passer en mode IP)" : "Mode IP (cliquer pour utiliser le GPS)"}
            aria-label="Basculer GPS/IP"
            className={`h-2.5 w-2.5 rounded-full ring-1 ring-white/40 ${useGPS ? "bg-red-500" : "bg-neutral-400"}`}
          />
          {/* bloc texte */}
          <div className="flex flex-col items-end leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-semibold tabular-nums text-[13px] md:text-[14px]">{tempTxt}</span>
              <span className="text-[12px] md:text-[13px]">{cityTxt}</span>
            </div>
            {/* Heure en blanc (client only). On supprime l'avertissement d’hydratation côté Next */}
            <div className="mt-0.5 text-right text-white text-[13px] md:text-[14px] leading-none" suppressHydrationWarning>
              {timeStr}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// app/famille/anniversaires/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

/* ================= Types (réponse /api/birthdays) ================= */
type Api = {
  ok: boolean;
  tz?: string;
  todayISO: string;
  birthdaysToday: { name: string; age?: number }[];
  memorialsToday: { name: string; years?: number }[];
  upcomingIn7Days?: { dateISO: string; name: string; age?: number }[];
  memorialsIn7Days?: { dateISO: string; name: string; years?: number }[];
};

/* ================= Helpers ================= */
const DEFAULT_AVATAR = "/family/_default.png"; // /public/family/_default.png

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function loadPhotoMap(): Record<string, string> {
  // Accepte BIRTHDAYS_PHOTOS_JSON (server env) ou NEXT_PUBLIC_BIRTHDAYS_PHOTOS_JSON (public env)
  const raw =
    process.env.BIRTHDAYS_PHOTOS_JSON ||
    process.env.NEXT_PUBLIC_BIRTHDAYS_PHOTOS_JSON ||
    "[]";
  try {
    const arr = JSON.parse(raw) as { name: string; photo: string }[];
    const out: Record<string, string> = {};
    for (const it of arr) out[norm(it.name)] = it.photo;
    return out;
  } catch {
    return {};
  }
}

function cloudThumb(publicId: string) {
  const cloud =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "";
  if (!cloud) return null;
  const encoded = encodeURIComponent(publicId);
  // vignette ronde visage 120x120
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_120,h_120,c_thumb,g_face,r_max/${encoded}`;
}

function photoUrl(map: Record<string, string>, name: string): string {
  const key = norm(name);
  const val = map[key] || map[name];
  if (!val) return DEFAULT_AVATAR;

  // Si c'est une URL complète ou un fichier public
  if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;

  // Sinon on suppose un public_id Cloudinary
  const t = cloudThumb(val);
  return t || DEFAULT_AVATAR;
}

function fmtDateFR(iso: string) {
  try {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "long",
    });
  } catch {
    return iso;
  }
}

/* ================= Page ================= */
export default async function AnniversairesPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const sp = (await searchParams) || {};
  const dateOverride = sp.date;

  // Construit l'origine (ok Local/Preview/Prod Vercel)
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const url = new URL("/api/birthdays", origin);
  if (dateOverride) url.searchParams.set("date", dateOverride);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API birthdays: HTTP ${res.status}`);
  }
  const data = (await res.json()) as Api;

  const photos = loadPhotoMap();

  const hasToday =
    (data.birthdaysToday?.length ?? 0) > 0 ||
    (data.memorialsToday?.length ?? 0) > 0;

  return (
    <main className="px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            Anniversaires <span aria-hidden>🎂</span> &nbsp;et&nbsp; Souvenirs{" "}
            <span aria-hidden>✝️</span>
          </h1>
          <p className="text-white/80">
            {dateOverride ? (
              <>
                Simulation —{" "}
                <span className="font-medium">{fmtDateFR(dateOverride)}</span>{" "}
                •{" "}
                <Link
                  href="/famille/anniversaires"
                  className="underline opacity-90 hover:opacity-100"
                  prefetch={false}
                >
                  revenir à aujourd’hui
                </Link>
              </>
            ) : (
              <>
                Aujourd’hui —{" "}
                <span className="font-medium">
                  {fmtDateFR(data.todayISO)}
                </span>{" "}
                ({data.tz || "Europe/Paris"})
              </>
            )}
          </p>
        </div>

        <Link
          href="/evenements"
          className="rounded-lg bg-white/15 px-3 py-2 text-white hover:bg-white/25"
          prefetch={false}
        >
          Ouvrir la page Événements
        </Link>
      </div>

      {/* Aujourd’hui */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Aujourd’hui</h2>

        {!hasToday ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/80">
            Aucun anniversaire ou souvenir aujourd’hui.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Anniversaires aujourd’hui */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">🎉 Anniversaires</div>
              {!(data.birthdaysToday?.length ?? 0) ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {data.birthdaysToday.map((p, i) => {
                    const u = photoUrl(photos, p.name);
                    return (
                      <li key={`bt-${i}`} className="flex items-center gap-3">
                        <Image
                          src={u}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="text-sm text-white/70">
                            {typeof p.age === "number"
                              ? `${p.age} an${p.age > 1 ? "s" : ""}`
                              : "Anniversaire"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Souvenirs aujourd’hui */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">✝️ Souvenirs</div>
              {!(data.memorialsToday?.length ?? 0) ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {data.memorialsToday.map((p, i) => {
                    const u = photoUrl(photos, p.name);
                    return (
                      <li key={`mt-${i}`} className="flex items-center gap-3">
                        <Image
                          src={u}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{p.name}</div>
                          <div className="text-sm text-white/70">
                            {typeof p.years === "number"
                              ? `${p.years} an${p.years > 1 ? "s" : ""} déjà`
                              : "Souvenir"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* À venir (7 jours) */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">À venir (7 jours)</h2>
        {!((data.upcomingIn7Days?.length ?? 0) || (data.memorialsIn7Days?.length ?? 0)) ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/80">
            Rien de prévu dans les 7 prochains jours.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Anniversaires à venir */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">🎉 Anniversaires</div>
              {!(data.upcomingIn7Days?.length ?? 0) ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {data.upcomingIn7Days!.map((e, i) => {
                    const u = photoUrl(photos, e.name);
                    return (
                      <li key={`ub-${i}`} className="flex items-center gap-3">
                        <Image
                          src={u}
                          alt={e.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{e.name}</div>
                          <div className="text-sm text-white/70">
                            {e.dateISO ? fmtDateFR(e.dateISO) : "Bientôt"}
                            {typeof e.age === "number"
                              ? ` • ${e.age} an${e.age > 1 ? "s" : ""}`
                              : ""}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Souvenirs à venir */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">✝️ Souvenirs</div>
              {!(data.memorialsIn7Days?.length ?? 0) ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {data.memorialsIn7Days!.map((e, i) => {
                    const u = photoUrl(photos, e.name);
                    return (
                      <li key={`um-${i}`} className="flex items-center gap-3">
                        <Image
                          src={u}
                          alt={e.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{e.name}</div>
                          <div className="text-sm text-white/70">
                            {e.dateISO ? fmtDateFR(e.dateISO) : "Bientôt"}
                            {typeof e.years === "number"
                              ? ` • ${e.years} an${e.years > 1 ? "s" : ""}`
                              : ""}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Astuce de test */}
      <p className="mt-6 text-xs text-white/50">
        Astuce : ajoute <code>?date=YYYY-MM-DD</code> à l’URL pour simuler un jour (ex.{" "}
        <code>?date=2025-10-21</code>).
      </p>
    </main>
  );
}

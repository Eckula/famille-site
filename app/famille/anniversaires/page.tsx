// app/famille/anniversaires/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';

/* ---------- helpers (photos) ---------- */
const photoMap = (() => {
  try {
    return process.env.BIRTHDAYS_PHOTOS_JSON
      ? (JSON.parse(process.env.BIRTHDAYS_PHOTOS_JSON) as Record<string, string>)
      : {};
  } catch {
    return {} as Record<string, string>;
  }
})();
const photoFor = (name: string) => photoMap[name] || '/family/_default.png';

/* ---------- helpers (format & pick) ---------- */
function pickFirstArray<T = any>(obj: any, keys: string[], fallback: T[] = []): T[] {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v as T[];
  }
  return fallback;
}
function asDateLabel(iso?: string) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

/* ---------- page ---------- */
export default async function AnniversairesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const dateOverride = sp?.date; // ?date=YYYY-MM-DD

  // Construit l’origine (OK local / preview / prod Vercel)
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  // Appel l’API interne /api/birthdays (pas de cache)
  const qs = new URLSearchParams();
  if (dateOverride) qs.set('date', dateOverride);
  const apiUrl = `${origin}/api/birthdays${qs.toString() ? `?${qs}` : ''}`;

  let data: any = null;
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    data = await res.json();
  } catch {
    data = null;
  }

  const tz = (data?.tz as string) || process.env.EVENTS_TZ || 'Europe/Paris';
  const todayISO: string =
    data?.date || data?.todayISO || dateOverride || new Date().toISOString().slice(0, 10);

  const birthdaysToday = pickFirstArray(data, ['birthdaysToday', 'todayBirthdays', 'today']);
  const memorialsToday = pickFirstArray(data, ['memorialsToday', 'todayMemorials']);

  const upcomingBirthdays = pickFirstArray(data, [
    'upcomingIn7Days',
    'birthdaysUpcoming',
    'upcomingBirthdays',
    'upcoming?.birthdays',
  ]);
  const upcomingMemorials = pickFirstArray(data, [
    'memorialsUpcomingIn7Days',
    'memorialsUpcoming',
    'upcomingMemorials',
    'upcoming?.memorials',
  ]);

  const hasToday = birthdaysToday.length > 0 || memorialsToday.length > 0;

  return (
    <main className="px-6 py-24 text-white">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            Anniversaires <span aria-hidden>🎂</span> <span className="mx-1">et</span> Souvenirs{' '}
            <span aria-hidden>✝️</span>
          </h1>
          <p className="text-white/80">
            {dateOverride ? (
              <>
                Simulation — <span className="font-medium">{asDateLabel(dateOverride)}</span> •{' '}
                <Link href="/famille/anniversaires" className="underline opacity-90 hover:opacity-100">
                  revenir à aujourd&apos;hui
                </Link>
              </>
            ) : (
              <>
                Aujourd&apos;hui — <span className="font-medium">{asDateLabel(todayISO)}</span> ({tz})
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

      {/* Aujourd'hui */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Aujourd&apos;hui</h2>

        {!hasToday ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/80">
            Aucun anniversaire ou souvenir aujourd&apos;hui.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Anniversaires aujourd'hui */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">🎉 Anniversaires</div>
              {birthdaysToday.length === 0 ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {birthdaysToday.map((p: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <Image
                        src={photoFor(p?.name || '')}
                        alt={p?.name || 'photo'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p?.name || '—'}</div>
                        <div className="text-sm text-white/70">
                          {p?.age !== undefined ? `${p.age} an${p.age > 1 ? 's' : ''}` : 'Anniversaire'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Souvenirs aujourd'hui */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">✝️ Souvenirs</div>
              {memorialsToday.length === 0 ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {memorialsToday.map((p: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <Image
                        src={photoFor(p?.name || '')}
                        alt={p?.name || 'photo'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p?.name || '—'}</div>
                        <div className="text-sm text-white/70">
                          {p?.years !== undefined ? `${p.years} an${p.years > 1 ? 's' : ''}` : 'Souvenir'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* À venir (7 jours) */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">À venir (7 jours)</h2>
        {upcomingBirthdays.length === 0 && upcomingMemorials.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/80">
            Rien de prévu dans les 7 prochains jours.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Anniversaires à venir */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">🎉 Anniversaires</div>
              {upcomingBirthdays.length === 0 ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {upcomingBirthdays.map((p: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <Image
                        src={photoFor(p?.name || '')}
                        alt={p?.name || 'photo'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p?.name || '—'}</div>
                        <div className="text-sm text-white/70">
                          {p?.dateISO ? asDateLabel(p.dateISO) : p?.date || 'Bientôt'}
                          {p?.age !== undefined ? ` • ${p.age} an${p.age > 1 ? 's' : ''}` : ''}
                          {p?.inDays !== undefined ? ` • J-${p.inDays}` : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Souvenirs à venir */}
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="mb-2 text-lg font-semibold">✝️ Souvenirs</div>
              {upcomingMemorials.length === 0 ? (
                <div className="text-white/70">—</div>
              ) : (
                <ul className="space-y-2">
                  {upcomingMemorials.map((p: any, i: number) => (
                    <li key={i} className="flex items-center gap-3">
                      <Image
                        src={photoFor(p?.name || '')}
                        alt={p?.name || 'photo'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{p?.name || '—'}</div>
                        <div className="text-sm text-white/70">
                          {p?.dateISO ? asDateLabel(p.dateISO) : p?.date || 'Bientôt'}
                          {p?.years !== undefined ? ` • ${p.years} an${p.years > 1 ? 's' : ''}` : ''}
                          {p?.inDays !== undefined ? ` • J-${p.inDays}` : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Aide / test */}
      <div className="mt-6 text-sm text-white/70">
        <p>
          Astuce : ajoute <code>?date=YYYY-MM-DD</code> à l’URL pour simuler un jour (ex.&nbsp;
          <code>?date=2025-10-21</code>). La pilule bleue permet aussi de tester les effets
          (long-press/clic droit).
        </p>
      </div>
    </main>
  );
}

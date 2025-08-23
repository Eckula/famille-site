// app/famille/anniversaires/page.tsx
import React from 'react';
import { computeBirthdays } from '@/lib/birthdays';

export const dynamic = 'force-dynamic';

function photosMap(): Record<string, string> {
  try { return process.env.BIRTHDAYS_PHOTOS_JSON ? JSON.parse(process.env.BIRTHDAYS_PHOTOS_JSON) : {}; }
  catch { return {}; }
}
const photoFor = (name: string) => (photosMap()[name] || '/family/_default.png');

function Card({ name, subtitle, img, accent = '🎂' }: { name: string; subtitle?: string; img: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-3 shadow-sm backdrop-blur-sm">
      <img src={img} alt={name} width={64} height={64} className="h-16 w-16 rounded-full border-2 border-white/30 object-cover" />
      <div>
        <div className="font-semibold">{accent} {name}</div>
        {subtitle && <div className="text-white/80">{subtitle}</div>}
      </div>
    </div>
  );
}

export default async function Page({ searchParams }: { searchParams?: { date?: string } }) {
  const tz = process.env.EVENTS_TZ || 'Europe/Paris';
  const dateParam = searchParams?.date;
  const now = dateParam ? new Date(`${dateParam}T12:00:00Z`) : new Date();
  const data = computeBirthdays(tz, now);

  return (
    <main className="mx-auto max-w-5xl p-6 text-white">
      <h1 className="mb-1 text-3xl font-bold">Anniversaires 🎂</h1>
      <p className="mb-4 text-white/70">Fuseau : {data.tz} — Aujourd’hui : {data.todayISO}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Aujourd’hui</h2>
        {data.birthdaysToday.length === 0 ? (
          <p className="text-white/70">Aucun anniversaire aujourd’hui.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.birthdaysToday.map((b: any, i: number) => (
              <Card key={i} name={`${b.name}${b.deceased ? ' (†)' : ''}`} subtitle={b.age !== undefined ? `${b.age} ans` : undefined} img={photoFor(b.name)} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">À venir (7 jours)</h2>
        {data.upcomingIn7Days.length === 0 ? (
          <p className="text-white/70">Rien cette semaine.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcomingIn7Days.map((b: any, i: number) => (
              <Card
                key={i}
                name={`${b.name}${b.deceased ? ' (†)' : ''}`}
                subtitle={`Dans ${b.inDays} j — ${String(b.day).padStart(2,'0')}/${String(b.month).padStart(2,'0')}${b.age !== undefined ? ` — ${b.age} ans` : ''}`}
                img={photoFor(b.name)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Souvenirs ✝️ (anniversaires de décès)</h2>
        {data.memorialsToday.length === 0 && data.memorialsIn7Days.length === 0 ? (
          <p className="text-white/70">Aucun souvenir aujourd’hui ni dans 7 jours.</p>
        ) : (
          <>
            {data.memorialsToday.length > 0 && (
              <>
                <h3 className="font-medium">Aujourd’hui</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.memorialsToday.map((m: any, i: number) => (
                    <Card key={i} name={m.name} subtitle={m.years !== undefined ? `${m.years} an(s)` : undefined} img={photoFor(m.name)} accent="✝️" />
                  ))}
                </div>
              </>
            )}
            {data.memorialsIn7Days.length > 0 && (
              <>
                <h3 className="font-medium">À venir (7 jours)</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.memorialsIn7Days.map((m: any, i: number) => (
                    <Card key={i} name={m.name} subtitle={`Dans ${m.inDays} j — ${String(m.deathDay).padStart(2,'0')}/${String(m.deathMonth).padStart(2,'0')}${m.years !== undefined ? ` — ${m.years} an(s)` : ''}`} img={photoFor(m.name)} accent="✝️" />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

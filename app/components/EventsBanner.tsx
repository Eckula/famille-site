// app/components/EventsBanner.tsx
import React from 'react';
import { computeBirthdays } from '@/lib/birthdays';

function getPhotosMap(): Record<string, string> {
  try { return process.env.BIRTHDAYS_PHOTOS_JSON ? JSON.parse(process.env.BIRTHDAYS_PHOTOS_JSON) : {}; }
  catch { return {}; }
}
const photoFor = (name: string) => (getPhotosMap()[name] || '/family/_default.png');

function Pill({ names, color, icon, href }: { names: string[]; color: 'yellow' | 'purple'; icon: string; href: string }) {
  const scheme = color === 'yellow'
    ? 'border-yellow-300/40 bg-yellow-300/20 text-yellow-900'
    : 'border-fuchsia-300/40 bg-fuchsia-300/20 text-fuchsia-100';
  return (
    <a href={href}
       className={`group flex items-center gap-3 rounded-xl border px-3 py-2 no-underline ${scheme}`}>
      <div className="flex -space-x-2">
        {names.slice(0,3).map((n, i) => (
          <img key={i} src={photoFor(n)} alt={n}
               width={36} height={36}
               className="h-9 w-9 rounded-full border-2 border-white/30 object-cover" />
        ))}
      </div>
      <div className="font-semibold">{icon} {names.join(', ')} — aujourd’hui !</div>
      <span className="ml-auto text-xs opacity-70">Voir la page</span>
    </a>
  );
}

export default async function EventsBanner() {
  const tz = process.env.EVENTS_TZ || 'Europe/Paris';
  const data = computeBirthdays(tz);

  const todayB = (data.birthdaysToday ?? []).map((b: any) => b.name);
  const todayM = (data.memorialsToday ?? []).map((m: any) => m.name);

  if (todayB.length === 0 && todayM.length === 0) return null;

  return (
    <div className="space-y-2">
      {todayB.length > 0 && <Pill names={todayB} color="yellow" icon="🎉" href="/famille/anniversaires" />}
      {todayM.length > 0 && <Pill names={todayM} color="purple" icon="✝️" href="/famille/anniversaires" />}
    </div>
  );
}

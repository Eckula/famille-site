// app/components/BirthdayBanner.tsx
import React from 'react';
import { computeBirthdays } from '@/lib/birthdays';

function getPhotosMap(): Record<string, string> {
  try {
    return process.env.BIRTHDAYS_PHOTOS_JSON
      ? JSON.parse(process.env.BIRTHDAYS_PHOTOS_JSON)
      : {};
  } catch {
    return {};
  }
}
function photoFor(name: string) {
  const map = getPhotosMap();
  return map[name] || '/family/_default.png';
}

export default async function BirthdayBanner() {
  const tz = process.env.EVENTS_TZ || 'Europe/Paris';
  const data = computeBirthdays(tz);
  const today = (data.birthdaysToday ?? []) as Array<{ name: string; age?: number }>;
  if (!today.length) return null;

  const heads = today.slice(0, 3);

  return (
    <a
      href="/famille/anniversaires"
      className="group flex items-center gap-3 rounded-xl border border-yellow-300/40 bg-yellow-300/20 px-3 py-2 text-yellow-900 no-underline hover:bg-yellow-300/30 dark:text-yellow-100"
    >
      <div className="flex -space-x-2">
        {heads.map((p, i) => (
          <img
            key={i}
            src={photoFor(p.name)}
            alt={p.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full border-2 border-yellow-200 object-cover"
          />
        ))}
      </div>
      <div className="font-semibold">
        🎉 {today.map((p) => p.name).join(', ')} — aujourd’hui !
      </div>
      <span className="ml-auto text-xs opacity-70">Voir la page</span>
    </a>
  );
}
